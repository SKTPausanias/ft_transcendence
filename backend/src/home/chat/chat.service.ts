import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { parse } from "path/posix";
import { In, Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { User } from "../user/userClass";
import { UserPublicInfoI } from "../user/userI";
import { ChatEntity } from "./chat.entity";
import { eChat } from "./eChat";
import { ChatRoomI, MessagesI } from "./iChat";
import { MessageEntity } from "./message.entity";

@Injectable()
export class ChatService {
    constructor(@InjectRepository(ChatEntity)
				private chatRepository: Repository<ChatEntity>,
				@InjectRepository(MessageEntity)
				private msgRepository: Repository<MessageEntity>,
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
		try {
			var msg: MessageEntity = <MessageEntity>{};
			const room = await this.chatRepository.findOne({ relations: ["members", "blocked_members"], where: {id: data.room.id}});		
			await this.userService.activateRoom(room.members, room.id);
			msg.owner = owner;
			msg.chat = room;
			msg.date = new Date().toLocaleString();
			msg.message = data.msg;
			const resp = await this.msgRepository.save(msg);
			return (this.parseOneMessage(resp, room.id));
		} catch (error) {
			return (<MessagesI>{});
		}
	}

	async getChatEntity(roomId: number): Promise<ChatEntity>
	{
		return (await this.chatRepository.findOne({ relations: ["members","blocked_members"], where: {id: roomId}}));
	}

	async getChatRoomById(user: UserEntity, roomId: number): Promise<ChatRoomI>
	{
		try {
			const room = await this.chatRepository.findOne({ relations: ["members", "blocked_members"], where: {id: roomId}});
			return (this.parseChatRoom(room, user));
		} catch (error) {
			return (<ChatRoomI>{});
		}
	}
	async getChatRoomsByIds(user: UserEntity): Promise<ChatEntity[]>{
		const roomEntities = await this.chatRepository.find({
			relations : ["members"],
			where: { id : In(user.active_chat_rooms)} //{id : user.active_chat_rooms}
		});
		return (roomEntities); 
	}
	async onMemberLeave(room: ChatRoomI, member: UserEntity){
		var resp: ChatEntity = <ChatEntity>{};
		try {
			const roomEntity = await this.chatRepository.findOne({relations: ["members", "blocked_members"], where: {id : room.id}})
			roomEntity.members = roomEntity.members.filter(item => item.login != member.login);
			/* if (roomEntity.members.length == 1)
			{
				const deleteRoom = await this.chatRepository.findOne({where : {id : room.id}})
			//	await this.chatRepository.delete(deleteRoom);
				await this.userService.desactivateRoom(roomEntity.members, room.id);
			}
			else
				resp = await this.chatRepository.save(roomEntity); */
			await this.userService.desactivateRoom([member], room.id);
			return (roomEntity);
		} catch (error) {
			console.log(error);
			return (resp);
		}
	}
	async onBlockUser(room: ChatRoomI, user: UserPublicInfoI): Promise<ChatRoomI>{
		try {
			const roomEntity = await this.chatRepository.findOne({
				relations: ["blocked_members", "members"], 
				where: {id: room.id}});
			const userEntity = await this.userService.findByLogin(user.login);
			roomEntity.blocked_members.push(userEntity);
			await this.chatRepository.save(roomEntity);
			const ret = (this.parseChatRoom(roomEntity, userEntity));
			return ret;
		} catch (error) {
			console.log("error");
			return (<ChatRoomI>{});
		}
	}

	parseChatRoom(chatRoom: ChatEntity, me: UserEntity){

		var parsed: ChatRoomI = <ChatRoomI>{};
		parsed.id = chatRoom.id;
		parsed.me = User.getPublicInfo(me);

		parsed.members = this.entitiesToInfo(chatRoom.members.filter(member => member.login != me.login));
		parsed.blocked = false;
		//Chat user 
		// bolcked = user.blocked
		// muted = 
		if (chatRoom.blocked_members.find(item => item.login == me.login) != undefined)
			parsed.blocked = true;
		if (chatRoom.name)
			parsed.name = chatRoom.name;
		else
		{
			if (parsed.members.length > 0)
				parsed.img = parsed.members[0].avatar;
			else
				parsed.img = parsed.me.avatar;
			if (parsed.members.length == 1)
				parsed.name = parsed.members[0].nickname;
			else
				parsed.name = parsed.members.slice(0, 3).map(a => a.nickname).join(",");
		}
		console.log("parsed: ", parsed);
		return (parsed);
	}

	private async findChatRoom(me: UserEntity, members: UserPublicInfoI[], name: string):Promise<ChatEntity>{
		try {
			var room: ChatEntity;
			const resp = await this.chatRepository.find({ relations: ["members","blocked_members"]});
			var users = await this.infoToUserEntities(members);
			users.push(me);
			if ((room = await this.getChatRoom(users)) == undefined)
				room = await this.newChatRoom(users, name);
			return (room);
		} catch (error) {
			return (<ChatEntity>{});
		}
	}
	private async newChatRoom(members: UserEntity[], name: string): Promise<ChatEntity>
	{
		try {
			var room = new ChatEntity();
			room.members = members;
			room.name = name;
			room.blocked_members = [];
			room = await this.chatRepository.save(room);
			return (room);
		} catch (error) {
			return (<ChatEntity>{});
		}
	}
	private async getChatRoom(members: UserEntity[]): Promise<ChatEntity | undefined>
	{
		try {
			const rooms = await this.chatRepository.find({ relations: ["members","blocked_members"]});
			for (let i = 0; i < rooms.length; i++)
				if (JSON.stringify(rooms[i].members)==JSON.stringify(members))
				{
					console.log("room found");
					return (rooms[i]);
				}
				console.log("Room not found");
			return (undefined);
		} catch (error) {
			return (undefined);
		}
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
		var userList: UserPublicInfoI[] = [];

		try {
			for (let i = 0; i < members.length; i++) {
				const user = members[i];
				userList.push(User.getPublicInfo(user));
			}
			return (userList);
		} catch (error) {
			return (userList);
		}
	}

	async getActiveChatRooms(me: UserEntity){
		var ret: ChatRoomI[] = [];
		try {
			for (var i = 0; i < me.active_chat_rooms.length; i++)
			{
				var roomId = me.active_chat_rooms[i];
				var room = await this.chatRepository.findOne({ 
					relations: ["members", "blocked_members"], where: {id : roomId}});
				ret.push(this.parseChatRoom(room, me));
			}
			ret.sort((a,b) => { return a.name > b.name ? 1 : -1});
			return (ret);
		} catch (error) {
			return (ret);
		}

	}

	async saveMsg(data: any){
		var msg: MessageEntity = <MessageEntity>{};
		msg.owner = data.room.me;
		msg.chat = data.room;
		msg.date = new Date().toLocaleString();
		msg.message = data.msg;
		await this.msgRepository.save(msg);
	}

	async getMessages(data:any){
		const resp = await this.msgRepository.find({
			relations: ["chat", "owner"], 
			where: {chat: data.room},
			order : { id : "ASC"}
		});
		return (this.parseMessages(resp, data.room.id));
	}

	private parseMessages(messages: MessageEntity[], chatId: number){
		var parsedMsgList: MessagesI[] = [];

		for (let i = 0; i < messages.length; i++) {
			var msgEntity = messages[i];
			parsedMsgList.push(this.parseOneMessage(msgEntity, chatId));
		}
		return(parsedMsgList);
	}

	private parseOneMessage(msgEntity: MessageEntity, chatId: number){
		var msg: MessagesI = {
			owner: User.getPublicInfo(msgEntity.owner),
			message: msgEntity.message,
			timeStamp: msgEntity.date,
			chatId: chatId
		}
		return(msg);
	}
}