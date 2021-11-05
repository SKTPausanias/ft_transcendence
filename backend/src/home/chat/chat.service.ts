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
			}
			else
				this.chatData.name_chat = body.chat_name;
			if (await this.chatRepository.findOne({where: {name_chat: this.chatData.name_chat}}) !== undefined)
				return (Response.makeResponse(600, { error: 'Name chat already exists'}));
			this.chatData.type_chat = body.chat_type;
			this.chatData.password = '123'; // this must be created in the frontend
			const ret = await this.chatRepository.insert(this.chatData);
			body.members.forEach(async user => {
				let usr = await this.userService.findByNickname(user.nickname);
				if (usr !== undefined && ret !== undefined)
					await this.chatUserRepository.insert({owner: true,  user: usr, chat: this.chatData});
			});
			return (Response.makeResponse(200, { ok: "Chat oneOnOne was saved" }));
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'unable to save chat' }));
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
			const messages = await this.messageRepository.find({ relations: ['user'], where: { chat: chat } });
			return (Response.makeResponse(200, { messages: messages }));
		} catch (error) {
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
			const chats = await this.chatRepository.find({ where: { type_chat: 'group' }});
			return (Response.makeResponse(200, { chats: chats }));
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'Unable to get chats' }));
		}
	}
}