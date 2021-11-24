import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { parse } from "path/posix";
import { In, Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { User } from "../user/userClass";
import { UserPublicInfoI } from "../user/userI";
import { ChatEntity } from "./entities/chat.entity";
import { eChat } from "./eChat";
import { ChatInfoI, ChatRoomI, MessagesI } from "./iChat";
import { MessageEntity } from "./entities/message.entity";
import { ChatUsersEntity } from "./entities/chatUsers.entity";

@Injectable()
export class ChatService {
	constructor(@InjectRepository(ChatEntity)
				private chatRepository: Repository<ChatEntity>,
				@InjectRepository(ChatEntity)
				private chatUserRepository: Repository<ChatUsersEntity>,
				/* @InjectRepository(MessageEntity)
				private msgRepository: Repository<MessageEntity> */
				private userService: UserService){}
	async onStart(me: UserEntity, members: UserPublicInfoI[], name: string): Promise<ChatRoomI>
	{
		try {
			const room = await this.findChatRoom(me, members, name);

			if (!me.active_chat_rooms)
				me.active_chat_rooms = [room.id];
			else if (me.active_chat_rooms.find(item => item == room.id) === undefined)
				me.active_chat_rooms.push(room.id);
			await this.userService.save(me);
			return (this.parseChatRoom(room, me));
		} catch (error) {
			return (<ChatRoomI>{});
		}
	}

	async newMessage(owner: UserEntity, data: any)
	{
		
	}

	async getChatEntity(roomId: number): Promise<ChatEntity>
	{
		return null;
	}

	async getChatRoomById(user: UserEntity, roomId: number): Promise<ChatRoomI>
	{
		return null
	}
	async getChatRoomsByIds(user: UserEntity): Promise<ChatEntity[]>{
		return null
	}
	async onMemberLeave(room: ChatRoomI, member: UserEntity){
		return null
	}
	async onBlockUser(room: ChatRoomI, user: UserPublicInfoI): Promise<ChatRoomI>{
		return null
	}

	parseChatRoom(chatRoom: ChatEntity, me: UserEntity){

		return null
	}

	private async findChatRoom(me: UserEntity, members: UserPublicInfoI[], name: string):Promise<ChatEntity>{
		try {
			var room: ChatEntity;
			var users = await this.infoToUserEntities(members);
			users.push(me);
			if (name == undefined)
			{
				if ((room = await this.getChatRoomByMembers(users)) == undefined)
					room = await this.newChatRoom(users, this.newChatInfo(name, 'private'));
				else
				{
					console.log("On room found: ", await this.chatRepository.find({relations : ["members"]}))
					console.log("room found");
				}
			}
			else
			{
				//find by name
			}
			return (room);
		} catch (error) {
			return (<ChatEntity>{});
		}
	}
	private async newChatRoom(members: UserEntity[], chatInfo: ChatInfoI): Promise<ChatEntity>
	{
		try {
			var room = new ChatEntity();
			room.members = this.getChatUserEntities(members, chatInfo);
			room.name = chatInfo.name;
			room.type = chatInfo.type;
			room.password = chatInfo.pwd;
			room = await this.chatRepository.save(room);
			/* for (let i = 0; i < room.members.length; i++) {
				const element = room.members[i];
				element.room = room;
				await this.chatUserRepository.save(element);
			} */
			console.log("saved room: ", room)
			console.log( "on find: ", await this.chatRepository.find({relations : ["members"]}))
		/* var room = new ChatEntity();
			room.members = members;
			room.name = name;
			room.blocked_members = [];
			room = await this.chatRepository.save(room);
			return (room); */
		} catch (error) {
			console.log("error: ", error);
			return (<ChatEntity>{});
		}
		return (<ChatEntity>{});

	}
	private async getChatRoomByMembers(members: UserEntity[]): Promise<ChatEntity | undefined>
	{
		try {
			const soretedMembers = members.sort((a,b) => {return a.id > b.id ? 1 : -1})
			const rooms = await this.chatRepository.find({ relations: ["members", "members.user"]});
			for (let i = 0; i < rooms.length; i++) {
				const room = rooms[i];
				const roomMembers = room.members;
				if (members.length == roomMembers.length)
				{
					const otherSorted =  roomMembers.sort((a,b) => {return a.id > b.id ? 1 : -1})
					if (JSON.stringify(soretedMembers) == JSON.stringify(otherSorted))
						return (room);
				}
			}
			return (undefined);
		} catch (error) {
			return (<ChatEntity>{});
		}
	}
	private async getChatMembers(){}
	getChatUserEntities(members: UserPublicInfoI[], info: ChatInfoI): ChatUsersEntity[]{
		var ret: ChatUsersEntity[] = []
		for (let i = 0; i < members.length; i++) {
			const member = members[i];
			const entity = <ChatUsersEntity>{
				user: member,
				owner: info.owner
			}
			ret.push(entity);
		}
		return (ret);
	}
	private async infoToUserEntities(members: UserPublicInfoI[]): Promise<UserEntity[]>
	{
		var entities: UserEntity[] = [];
		try {
			for (let i = 0; i < members.length; i++) {
				const login = members[i].login;
				const user = await this.userService.findByLogin(login);
				entities.push(user);
			}
			return (entities);
		} catch (error) {
			return (entities);
		}
	}
	private  entitiesToInfo(members: UserEntity[]): UserPublicInfoI[]
	{
		return null
	}

	async getActiveChatRooms(me: UserEntity){
		return null

	}

	async saveMsg(data: any){
		return null
	}

	async getMessages(data:any){
		return null
	}

	private parseMessages(messages: MessageEntity[], chatId: number){
		return null
	}

	private parseOneMessage(msgEntity: MessageEntity, chatId: number){
		return null
	}


	// (pepe, true);
	newChatInfo(name: string, type: string, pwd?: string, owner?: boolean)
	{
		return (<ChatInfoI>{
			name : name,
			type : type,
			pwd : pwd,
			owner : owner ? true : false
		})
	}
}