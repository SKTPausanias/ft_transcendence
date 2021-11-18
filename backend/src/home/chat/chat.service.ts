import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { ChatEntity } from "./chat.entity";
import { MessageEntity } from "./message.entity";
import { Response } from 'src/shared/response/responseClass';
import { UserService } from "../user/user.service";
import { SessionService } from "src/session/session.service";
import { UserPublicInfoI } from "../user/userI";
import { ChatUsersEntity } from "./chatUsers.entity";
import { User } from "../user/userClass";

@Injectable()
export class ChatService {
	private chatData = new ChatEntity();
	
	constructor(
		@InjectRepository(ChatEntity) private chatRepository: Repository<ChatEntity>,
		@InjectRepository(MessageEntity) private messageRepository: Repository<MessageEntity>,
		@InjectRepository(ChatUsersEntity) private chatUserRepository: Repository<ChatUsersEntity>,
		private sessionService: SessionService,
		//A circular dependency occurs when two classes depend on each other. For example, class A needs class B, and class B also needs class A. 
		@Inject(forwardRef(() => UserService)) // forwardRef solves circular dependencies: 
		private userService: UserService,
	) { }

	async queryOneChat(users: any[]): Promise<any>{
		console.log("members of body: ", users);
		return (await this.chatRepository.findOne({
			where: [
				{name_chat: users[0].id + '_' + users[1].id}, //Or expresion searching for prevous existing chat OneOnOne
				{name_chat: users[1].id + '_' + users[0].id}]
			}));
	}

	async saveChatGroup(body: any, header: string): Promise<any> {
		const token = header.split(' ')[1]; //must check is session is active before continue
		try {
			if (body.chat_type == "oneToOne") {
				if (await this.queryOneChat(body.members) !== undefined){
					return (Response.makeResponse(200, { ok: "Chat oneOnOne was restored" }));
				}
				this.chatData.name_chat = body.members[0].id + '_' + body.members[1].id;
				console.log("name_chat: ", this.chatData.name_chat);
			}
			else
				this.chatData.name_chat = body.name_chat;
			if (await this.chatRepository.findOne({where: {name_chat: this.chatData.name_chat}}) !== undefined)
				return (Response.makeResponse(600, { error: 'Name chat already exists'}));
			this.chatData.type_chat = body.chat_type;
			//this.chatData.password = body.password; // this must be created in the frontend -- undefined if is one to one after adding friendship?
			//this.chatData.protected = body.protected;
			this.chatData.password = "";
			this.chatData.protected = false;
			const ret = await this.chatRepository.insert(this.chatData);
			body.members.forEach(async user => {
				let usr = await this.userService.findByNickname(user.nickname);
				if (usr !== undefined && ret !== undefined)
					await this.chatUserRepository.insert({owner: true,  user: usr, chat: this.chatData});
			});
			return (Response.makeResponse(200, { ok: "Successful operation" }));
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'unable to create' }));
		}
	}

	/*
	* When a message comes from the frontend chat, we need to check if emiter and receiver has a chat oneToOne created
	* if is correct, we save the message, chatID which both user belong and the id of the user propietary
	*/
	async saveMessage(body: any, header: string): Promise<any> {
		const token = header.split(' ')[1]; //must check is session is active before continue
		var eMsg = new MessageEntity();
		try {

			const session = await this.sessionService.findSessionWithRelation(token);
			const friend = await this.userService.findByNickname(body.receiver);
			eMsg.message = body.message;
			eMsg.user = session.userID;
			eMsg.date = body.timestamp;
			var name_chat = session.userID.id + '_' + friend.id;
			var name_chat2 = friend.id + '_' + session.userID.id;

			const chat = await this.chatRepository.findOne({
				where: [{ name_chat: name_chat }, { name_chat: name_chat2 }]
			}); // this is an OR
			eMsg.chat = chat;
			const ret = await this.messageRepository.save(eMsg);
			return (Response.makeResponse(200, { ok: "Message has been saved" }));
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'Unable to save message' }));
		}
	}

	async saveGroupMessage(body:any, header: string): Promise<any> {
		const token = header.split(' ')[1]; //must check is session is active before continue
		var eMsg = new MessageEntity();
		console.log("Data from channel body save group message: ", body);
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			eMsg.message = body.message;
			eMsg.user = session.userID;
			eMsg.date = body.timestamp;
			const chat = await this.chatRepository.findOne({
				where: { name_chat: body.receiver.name_chat }
			});
			eMsg.chat = chat;
			const ret = await this.messageRepository.save(eMsg);
			return (Response.makeResponse(200, { ok: "Message has been saved" }));
		}
		catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'Unable to save message' }));
		}
	}

	async getMessages(body: any, header: string): Promise<any> {
		const token = header.split(' ')[1]; //must check is session is active before continue
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			const friend = await this.userService.findByNickname(body.receiver);
			const name_chat = session.userID.id + '_' + friend.id;
			const name_chat2 = friend.id + '_' + session.userID.id;
			const chat = await this.chatRepository.findOne({
				where: [{ name_chat: name_chat }, { name_chat: name_chat2 }]
			}); // this is an OR
			// find all messages from chat with relations
			// get messages from chat in order 
			const messages = await this.messageRepository.find({
				relations: ['user'],
				where: { chat: chat },
				order: { date: "ASC" }
			});
			//const messages = await this.messageRepository.find({ relations: ['user'], where: { chat: chat } }); // old cause the order was not working
			//console.log("Messages in backend getMessages(): ", messages);
			return (Response.makeResponse(200, { messages: messages }));
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'Unable to get messages' }));
		}
	}

	async getGroupMessages(body : any, header: string): Promise<any> {
		const token = header.split(' ')[1]; //must check is session is active before continue
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			const chat = await this.chatRepository.findOne({
				where: { name_chat: body.channel.name_chat }
			});
			const messages = await this.messageRepository.find({
				relations: ['user'],
				where: { chat: chat },
				order: { date: "ASC" }
			});
			return (Response.makeResponse(200, { messages: messages }));
		}
		catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'Unable to get messages' }));
		}
	}

	async getChatGroups(header: any): Promise<any> {
		const token = header.split(' ')[1]; //must check is session is active before continue
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			//find all chats where type_chat = group 
			const chats = await this.chatRepository.find({ where: [{ type_chat: 'public' }, { type_chat: 'private' }]});
			return (Response.makeResponse(200, { chats: chats }));
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'Unable to get chats' }));
		}
	}
	async getOwnChannels(header: string): Promise<any> {
		const token = header.split(' ')[1]; //must check is session is active before continue
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			const chatUsers = await this.chatUserRepository.find({relations: ['chat'], where: {user: session.userID}});
			var chats: any[] = [];
			for (var i = 0; i < chatUsers.length; i++)
				chatUsers[i].chat.type_chat != 'oneToOne'? chats.push(chatUsers[i].chat) : null;
			return (Response.makeResponse(200, { chats: chats }));
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'Unable to get chats' }));
		}
	}

	async getChatUsers(body: any, header: string): Promise<any> {
		const token = header.split(' ')[1]; //must check is session is active before continue
		try {
			const session = await this.sessionService.findSessionWithRelation(token);

			var retUsers: UserPublicInfoI[] = [];
			
			const chat = await this.chatRepository.findOne({where: { id: body.id}});
			
			const users = await this.chatUserRepository.find({relations: ['user'], where: {'chat': chat}});
			
			for (var i = 0; i < users.length; i++)
				retUsers.push(User.getPublicInfo(users[i].user));
			
			return (Response.makeResponse(200, { users: retUsers }));
		} catch (error) {
			console.log("Error.---");
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'Unable to get chats' }));
		}
		
	}

	async blockUser(body: any, header: string){
		const token = header.split(' ')[1];
		console.log("body: ", body);
		var users: any[] = [];
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			/* await members.forEach( async element => { */
			for (var i = 0; i < body.members.length; i++)
				users.push(await this.userService.findByNickname(body.members[i].nickname));
			const ret = await this.queryOneChat(users);
			//console.log("members to ban: ", ret);
			if (ret !== undefined)
			{
				if (body.isBlocked == false)
					await this.chatUserRepository.update({user: users[1], chat: ret} , {muted: true});
				else
					await this.chatUserRepository.update({user: users[1], chat: ret} , {muted: false});
				return (Response.makeResponse(200, { ok: "User has been banned" }));
			}
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'Unable to ban user' }));
		}
	}

	async iAmBlocked(friend: any, header: string){
		const token = header.split(' ')[1];
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			const friendObj = await this.userService.findByNickname(friend.nickname);
			const name_chat = session.userID.id + '_' + friendObj.id;
			const name_chat2 = friendObj.id + '_' + session.userID.id;
			const chat = await this.chatRepository.findOne({
				where: [{ name_chat: name_chat }, { name_chat: name_chat2 }]
			});
			const chatUser = await this.chatUserRepository.findOne({ where: { user: session.userID, chat: chat } });
			return (Response.makeResponse(200, { blocked: chatUser.muted }));		}
		catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'Unable to check friend' }));
		}
	}

	async friendIsBlocked(friend: any, header: string) {
		const token = header.split(' ')[1];
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			const friendObj = await this.userService.findByNickname(friend.nickname);
			const name_chat = session.userID.id + '_' + friendObj.id;
			const name_chat2 = friendObj.id + '_' + session.userID.id;
			const chat = await this.chatRepository.findOne({
				where: [{ name_chat: name_chat }, { name_chat: name_chat2 }]
			});
			const chatUser = await this.chatUserRepository.findOne({ where: { user: friendObj, chat: chat } });
			return (Response.makeResponse(200, { blocked: chatUser.muted }));
		}
		catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'Unable to check friend' }));
		}
	}

	async updatePassChannel(channelInfo: any, header: string): Promise<any> {
		const token = header.split(' ')[1]; //must check is session is active before continue
		try {
			const register = await this.chatRepository.findOne({where: {name_chat: channelInfo.name_chat}}); 
			const ret = await this.chatRepository.update(register, {password: channelInfo.password, protected: channelInfo.protected});//maybe we can solve this in one call: where id or chatName;
			return (Response.makeResponse(200, { ok: "Successful operation", result: ret }));
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'unable to create' }));
		}
	}

	async updateMembersChannel(content: any, header: string): Promise<any> {
		const token = header.split(' ')[1]; //must check is session is active before continue
		try {
			console.log("ChannelInfo content: ", content);
			const register = await this.chatRepository.findOne({where: {name_chat: content.channelInfo.name_chat}});
			console.log("Chat to modify their members: ", register);
			//if member exist on chat_user and is selected to be delete, we should delete it
			//if member is a new member of the group, we should insert
			//two member object have to come in the body, newMembers[] deleteMembers[]
			//iterate them en delete or insert when have to. 
			return (Response.makeResponse(200, { ok: "Successful operation" }));
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'unable to create' }));
		}
	}

	async findChatByName(chat_name: string): Promise<any> {
		try {
			const chat = await this.chatRepository.findOne({ where: { name_chat: chat_name } });
			return (chat);
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'Unable to get chat' }));
		}
	}

	async isMuted(body: any, header: string): Promise<any> {
		const token = header.split(' ')[1];
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			const chat = await this.chatRepository.findOne({ where: { name_chat: body.channel.name_chat } });
			const chatUser = await this.chatUserRepository.findOne({ where: { user: session.userID, chat: chat } });
			return (Response.makeResponse(200, { muted: chatUser.muted }));
		}
		catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'Unable to check if user muted' }));
		}
	}

	async muteUserGroup(body: any, header: string): Promise<any> {
		const token = header.split(' ')[1];
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			const user = await this.userService.findByNickname(body.user.nickname);
			const chat = await this.chatRepository.findOne({ where: { name_chat: body.channel.name_chat } });
			const chatUser = await this.chatUserRepository.findOne({ where: { user: user, chat: chat } });
			if (chatUser.muted == false)
				await this.chatUserRepository.update({ user: user, chat: chat }, { muted: true });
			else
				await this.chatUserRepository.update({ user: user, chat: chat }, { muted: false });
			return (Response.makeResponse(200, { ok: "User has been muted" }));
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'Unable to mute user' }));
		}
	}
}