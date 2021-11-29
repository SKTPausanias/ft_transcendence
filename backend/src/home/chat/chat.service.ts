import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { User } from "../user/userClass";
import { UserPublicInfoI } from "../user/userI";
import { ChatEntity } from "./entities/chat.entity";
import { ChatI, ChatInfoI, ChatPasswordUpdateI, ChatRoomI, ChatUserI, MessagesI, NewMessageI, RoomKeyI } from "./iChat";
import { MessageEntity } from "./entities/message.entity";
import { ChatUsersEntity } from "./entities/chatUsers.entity";
import { Response } from "src/shared/response/responseClass";
import { Exception } from "src/shared/utils/exception";
import { eChatType } from "./eChat";
import { ActiveRoomEntity } from "./entities/activeRoom.entity";
import { SessionService } from "src/session/session.service";
import { HashService } from "src/shared/hash/hash.service";

@Injectable()
export class ChatService {
	chatName: string;
	constructor(@InjectRepository(ChatEntity)
				private chatRepository: Repository<ChatEntity>,
				@InjectRepository(ChatUsersEntity)
				private chatUserRepository: Repository<ChatUsersEntity>,
				@InjectRepository(MessageEntity)
				private msgRepository: Repository<MessageEntity>,
				@InjectRepository(ActiveRoomEntity)
				private activeRoomRepository: Repository<ActiveRoomEntity>,
				private userService: UserService,
				private sessionService: SessionService,
				private hashService: HashService){}

	async onStart(me: UserEntity, members: UserPublicInfoI[], chatInfo: ChatI): Promise<ChatRoomI>
	{
		try {
			const room = await this.findChatRoom(me, members, chatInfo);
			await this.activateRoom([me], room);
			const chatMe = await this.chatUserRepository.findOne({
				relations: ['user'],
				where: {user: me.id}});
			return (this.parseChatRoom(room, chatMe));
		} catch (error) {
			return (<ChatRoomI>{});
		}
	}
	async getActiveChatRooms(me: UserEntity){
		var ret: ChatRoomI[] = [];
		try {
			const active: ActiveRoomEntity[] = await this.activeRoomRepository.find({
				relations: ['user', 'chat', 'chat.members', "chat.members.user"],
				where: { user: me.id}
			});
			for (var i = 0; i < active.length; i++)
			{
				var chatUser = active[i].chat.members.find(item => item.user.id == me.id);
				ret.push(this.parseChatRoom(active[i].chat, chatUser));
			}
			return (ret);
		} catch (error) {
			return (ret);
		}
	}

	async getAllMessages(data:any){
		const msg = await this.msgRepository.find({
			relations : ["chat", "owner"],
			where: {chat : data.room.id},
			order: {id : "ASC"}
		}) 
		return (this.parseMessages(msg));
	}
	async newMessage(owner: UserEntity, data: any): Promise<NewMessageI>
	{
		try {
			const room = await this.chatRepository.findOne({ 
				relations: ["members", "members.user"],
				 where: {id: data.room.id}});
			const userEntities = this.chatUserToUserEntity(room.members);
			await this.activateRoom(userEntities, room);
			const msgEntity = await this.saveMsg(room, owner, data.msg);
			return (<NewMessageI>{
				emitTo : userEntities,
				message : this.parseOneMessage(msgEntity)
			});
		} catch (error) {
			return (<NewMessageI>{});
		}
	}

	async getChatEntity(roomId: number): Promise<ChatEntity>
	{
		return null;
	}

	async getChatRoomById(roomId: number): Promise<ChatEntity | undefined>
	{
		try {
			const room = await this.chatRepository.findOne({
				relations: ["members", "members.user"],
				where : {id : roomId}
			});
			return (room);
		} catch (error) {
			return (undefined);
		}
		return null
	}
	async getChatRoomsByIds(user: UserEntity): Promise<ChatEntity[]>{
		return null
	}
	async onMemberLeave(room: ChatRoomI, member: UserEntity){
		return null
	}
	async onBlockUser(room: ChatRoomI, user: UserPublicInfoI): Promise<ChatEntity>{
		const roomEntity = await this.chatRepository.findOne({
			relations: ["members", "members.user"],
			where : {id : room.id}
		});
		const chatUser = roomEntity.members.find(item => item.user.login == user.login);
		chatUser.banned = chatUser.banned ? false : true;
		await this.chatUserRepository.save(chatUser);
		return (roomEntity);
	}
	async onMuteUser(room: ChatRoomI, user: UserPublicInfoI): Promise<ChatEntity>{
		const roomEntity = await this.chatRepository.findOne({
			relations: ["members", "members.user"],
			where : {id : room.id}
		});
		const chatUser = roomEntity.members.find(item => item.user.login == user.login);
		chatUser.muted = chatUser.muted ? false : true;
		await this.chatUserRepository.save(chatUser);
		return (roomEntity);
	}

	private async findChatRoom(me: UserEntity, members: UserPublicInfoI[], chatInfo: ChatI):Promise<ChatEntity>{
		try {
			var room: ChatEntity;
			var users = await this.infoToUserEntities(members);
			users.push(me);
			users = users.sort((a,b)=> { return a.id > b.id ? 1 : -1});
			this.setChatName(users);
			if (chatInfo.type == eChatType.DIRECT)
			{
				room = await this.chatRepository.findOne({
					relations: ["members", "members.user"],
					where: {name: this.chatName}
				});
				if (room == undefined){
					const roomInfo = this.newChatInfo(this.chatName, chatInfo.type);//change type for oneToOne
					const chatMembers =  this.getChatUserEntities(users, this.newChatUserInfo(false));
					room = await this.newChatRoom(chatMembers, roomInfo);
				}
			}
			return (room);
		} catch (error) {
			return (<ChatEntity>{});
		}
	}
	private async newChatRoom(members: ChatUsersEntity[], chatInfo: ChatI): Promise<ChatEntity | undefined>
	{
		try {
			var room = new ChatEntity();

			room.members = members;
			room.name = chatInfo.name;
			room.type = chatInfo.type;
			if (chatInfo.password != undefined)
				room.password = this.hashService.hash(chatInfo.password);
			room.protected = chatInfo.protected;
			
			if ((room = await this.chatRepository.save(room)) === undefined) //warn: if any issue change to insert
				return (undefined);
			for (let i = 0; i < room.members.length; i++)
			{
				room.members[i].room = room;
				await this.chatUserRepository.save(room.members[i]); //warn: if any issue change to insert
			}
			return (room);
		} catch (error) {
			return (undefined);
		}
	}
	 async addChanel(channelInfo: ChatI, header: string): Promise<any> {
		const token = header.split(' ')[1];
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			if (session == undefined)
				return (Response.makeResponse(401, { error: "unauthorized" }));
			const check = await this.chatRepository.findOne({
				where: { name: channelInfo.name }
			});
			if (check !== undefined)
				return (Response.makeResponse(600, { error: "Channel already exists" }));

			var users: UserEntity[] = await this.infoToUserEntities(channelInfo.members);
			var chatMembers =  this.getChatUserEntities(users, this.newChatUserInfo(false));
			chatMembers[0].owner = true;

			const room = await this.newChatRoom(chatMembers, channelInfo);
			if ( room === undefined ) 
				return (Response.makeResponse(500, { error: "can't creat channel" }));	
			await this.activateRoom(this.chatUserToUserEntity(chatMembers), room);

			var chatUser = room.members.find(member => member.user.id == session.userID.id);
			return (Response.makeResponse(200, this.parseChatRoom(room, chatUser)));
		} catch (error) {
			return (Response.makeResponse(500, { error: "can't creat channel" }));
		}
	}
	async unlockRoom(key: RoomKeyI, header: string): Promise<any>{
		const token = header.split(' ')[1]; //must check if session is active before continue
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			if (session == undefined)
				return (Response.makeResponse(401, { error: "unauthorized" }));

			const room = await this.getChatRoomById(key.id);
			if (!await this.hashService.compare(key.password, room.password))
				return (Response.makeResponse(401, { error: "unauthorized" }));

			var chatUser = room.members.find(member => member.user.id == session.userID.id);
			if (chatUser == undefined)
				return (Response.makeResponse(500, { error: "can't unlock room" }));
				
			chatUser.hasRoomKey = true;
			chatUser = await this.chatUserRepository.save(chatUser);
			console.log(chatUser);
			return (Response.makeResponse(200, this.parseChatRoom(room, chatUser)));	
		} catch (error) {
			console.log("errro");
			return (Response.makeResponse(500, { error: "can't unlock room" }));

		}
	}
	async updatePassChannel(channelInfo: ChatPasswordUpdateI, header: string): Promise<any> {
		console.log("lets change pasword");
		const token = header.split(' ')[1]; //must check is session is active before continue
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			if (session == undefined)
				return (Response.makeResponse(401, { error: "unauthorized" }));
			var room = await this.getChatRoomById(channelInfo.chatId)
			if (await this.hashService.compare(channelInfo.password, room.password))
				return (Response.makeResponse(600, {error : "Looks like you are trying to save same password"}));
			if ((room.protected = channelInfo.protected) && channelInfo.password != undefined)
				room.password =  this.hashService.hash(channelInfo.password);
			room = await this.chatRepository.save(room);
			var chatUser = room.members.find(member => member.user.id == session.userID.id); //owner
			var members = room.members.filter(member => member.user.id != chatUser.user.id); //members
			members = members.map(item => ({ ...item, hasRoomKey: false})); //all members lost room key
			await this.chatUserRepository.save(members); //update members
			return (Response.makeResponse(200, this.parseChatRoom(room, chatUser))); //return parsed room
		} catch (error) {
			return (Response.makeResponse(410, {error }));
		}
	}
	async addMemberToChat(room: ChatRoomI, user: UserPublicInfoI): Promise<ChatEntity | undefined>
	{
		try {
			var chatRoom = await this.chatRepository.findOne({
				relations: ["members", "members.user"],
				where: {id : room.id}
			})
			if (chatRoom.members.find(member => member.user.login == user.login) != undefined)
				return (undefined)
			var chatUser = this.getChatUserEntity(user, this.newChatUserInfo(false));
			chatUser.room = chatRoom;
			chatUser.user = await this.userService.findByLogin(user.login);
			chatUser = await this.chatUserRepository.save(chatUser);
			chatRoom.members.push(chatUser);
			chatRoom = await this.chatRepository.save(chatRoom)
			await this.activateRoom([chatUser.user], chatRoom);
			return (chatRoom);
		} catch (error) {
			return (undefined)
		}
	}
	private chatUserToUserEntity(chatUsers: ChatUsersEntity[]){
		let users: UserEntity[] = [];
		for (let i = 0; i < chatUsers.length; i++) {
			const element = chatUsers[i];
			users.push(element.user);
		}
		return (users);
	}
	getChatUserEntities(members: UserPublicInfoI[], info: ChatUserI): ChatUsersEntity[]{
		var ret: ChatUsersEntity[] = []
		for (let i = 0; i < members.length; i++)
			ret.push(this.getChatUserEntity(members[i], info));
		return (ret);
	}
	getChatUserEntity(member: UserPublicInfoI, info: ChatUserI){
		return (<ChatUsersEntity>{
			user: member,
			owner: info.owner
		})
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
	private  chatUserToUserInfo(members: ChatUsersEntity[]): UserPublicInfoI[]
	{
		var userList: UserPublicInfoI[] = [];
		try {
			for (let i = 0; i < members.length; i++) {
				const chatUser = members[i];
				userList.push(User.getPublicInfo(chatUser.user));
			}
			return (userList);
		} catch (error) {
			return (userList);
		}
	}

	async saveMsg(room: ChatEntity, owner: UserEntity, msg: string){
		var msgEntity: MessageEntity = <MessageEntity>{
			owner : owner,
			chat : room,
			date : new Date().toLocaleString(),
			message : msg
		}
		return (await this.msgRepository.save(msgEntity));
	}


	parseChatRoom(chatRoom: ChatEntity, me: ChatUsersEntity): ChatRoomI{

		var parsed: ChatRoomI = <ChatRoomI>{};
		parsed.id = chatRoom.id;
		parsed.me = User.getPublicInfo(me.user);
		parsed.members = this.chatUserToUserInfo(chatRoom.members.filter(member => member.user.id != me.user.id));
		parsed.onlineStatus = (parsed.members.find(usr => usr.online == true) != undefined);
		parsed.owner = me.owner;
		parsed.muted = this.chatUserToUserInfo(chatRoom.members.filter(member => member.muted));
		parsed.banned = this.chatUserToUserInfo(chatRoom.members.filter(member => member.banned));
		parsed.type = chatRoom.type;
		parsed.protected = chatRoom.protected;
		parsed.hasRoomKey = me.hasRoomKey;
		if (chatRoom.type != eChatType.DIRECT)
			parsed.name = chatRoom.name;
		if (chatRoom.type == eChatType.DIRECT)
		{
			parsed.img = parsed.members[0].avatar;
			parsed.name = parsed.members[0].nickname;
		}
		return (parsed);
	}

	private parseMessages(messages: MessageEntity[]){
		var parsedMsgList: MessagesI[] = [];

		for (let i = 0; i < messages.length; i++) {
			var msgEntity = messages[i];
			parsedMsgList.push(this.parseOneMessage(msgEntity));
		}
		return(parsedMsgList);	}

	private parseOneMessage(msgEntity: MessageEntity){
		var msg: MessagesI = {
			owner: User.getPublicInfo(msgEntity.owner),
			message: msgEntity.message,
			timeStamp: msgEntity.date,
			chatId: msgEntity.chat.id
		}
		return(msg);	
	}


	setChatName(users: UserEntity[]){
		this.chatName = '';
		for (let i = 0; i < users.length; i++) {
			this.chatName += users[i].id;
			if (i < users.length - 1)
				this.chatName += '_';	
		}
	}
	newChatInfo(name: string, type: string, password?: string, lock?: boolean): any
	{
		return (<ChatI>{
			name : name,
			type : type,
			password : password,
			protected: lock
		})
	}
	
	newChatUserInfo(owner: boolean): any
	{
		return (<ChatUserI>{
			owner: owner,
			muted: false,
			baned: false
		})
	}

	private async activateRoom(users: UserEntity[], chatRoom: ChatEntity): Promise<void>{
		var active: ActiveRoomEntity = new ActiveRoomEntity();
		active.chat = chatRoom;
		for (var i = 0; i < users.length; i++) {
			active.user = users[i];
			const cmpActive = await this.activeRoomRepository.findOne({
				relations: ['chat', 'user'],
				where: {chat: chatRoom.id, user: users[i].id}
			})
			if (cmpActive == undefined)
				await this.activeRoomRepository.save(active);
		}
	}

	async deActivateRoom(user: UserEntity, chatRoom: ChatEntity): Promise<void>{
		const active = await this.activeRoomRepository.findOne({
			relations: ['user', 'chat'],
			where: { user: user.id , chat: chatRoom.id}
		});
		if (active !== undefined)
			await this.activeRoomRepository.delete(active);
	}
}