import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Like, Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { User } from "../user/userClass";
import { UserPublicInfoI } from "../user/userI";
import { ChatEntity } from "./entities/chat.entity";
import { ChatI, ChatInfoI, ChatPasswordUpdateI, ChatRoomI, ChatUserI, MessagesI, NewMessageI, RoomKeyI, SearchRoomI } from "./iChat";
import { MessageEntity } from "./entities/message.entity";
import { ChatUsersEntity } from "./entities/chatUsers.entity";
import { Response } from "src/shared/response/responseClass";
import { Exception } from "src/shared/utils/exception";
import { eChatType } from "./eChat";
import { ActiveRoomEntity } from "./entities/activeRoom.entity";
import { SessionService } from "src/session/session.service";
import { HashService } from "src/shared/hash/hash.service";
import { UnreadMessageEntity } from "./entities/unread-message.entity";

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
				@InjectRepository(UnreadMessageEntity)
				private unreadedMsgRepository: Repository<UnreadMessageEntity>,
				private userService: UserService,
				private sessionService: SessionService,
				private hashService: HashService){}

	async onStart(me: UserEntity, members: UserPublicInfoI[], chatInfo: ChatI): Promise<ChatRoomI>
	{
		try {
			const room = await this.findChatRoom(me, members, chatInfo);
			await this.activateOneUserRoom(me, room);
			const chatMe = await this.chatUserRepository.findOne({
				relations: ['user', "unreadMessages"],
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
				relations: ['user', 'chat', 'chat.members', "chat.members.user", "chat.members.unreadMessages"],
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
			const room = await this.getChatRoomById(data.room.id);
			const userEntities = this.chatUserToUserEntity(room.members);
			await this.activateUserRooms(userEntities, room);
			const msgEntity = await this.saveMsg(room, owner, data.msg);
			await this.markAsUnreaded(msgEntity)
			return (<NewMessageI>{
				emitTo : userEntities,
				message : this.parseOneMessage(msgEntity)
			});
		} catch (error) {
			return (<NewMessageI>{});
		}
	}
	
	async markAsUnreaded(msgEntity: MessageEntity): Promise<void>
	{
		const members = msgEntity.chat.members;
		try {
			for (let i = 0; i < members.length; i++) {
				const unreadedMessage = new UnreadMessageEntity();
				const member = members[i];
				if (member.user.id == msgEntity.owner.id)
					continue ;
				unreadedMessage.message = msgEntity;
				unreadedMessage.chatUser = member;
				member.unreadMessages.push(unreadedMessage);
				await this.chatUserRepository.save(member)
				await this.unreadedMsgRepository.save(unreadedMessage);
			}
		} catch (error) {
			console.log(error)
		}
	}
	
	async markAsReaded(user: UserEntity, room: ChatRoomI): Promise<number>
	{
		try {
			var chatUser = await this.chatUserRepository.findOne({
				relations: ["room", "user", "unreadMessages"],
				where: {
					room:{
						id : room.id
					},
					user: user.id
				}
			})
			if (chatUser != undefined)
			{
				await this.unreadedMsgRepository.remove(chatUser.unreadMessages);
				chatUser.unreadMessages = [];
				chatUser = await this.chatUserRepository.save(chatUser);
			}
			return (await this.getUnreadedMsg(user));
		} catch (error) {
			console.log(error)
			return (0);
		}
	}
	async getUnreadedMsg(user: UserEntity): Promise<number>
	{
		var unreaded = 0;
		try {
			var chatUsers = await this.chatUserRepository.find({
				relations: ["user", "unreadMessages"],
				where: {user : user.id}
			})
			if (chatUsers != undefined)
				for (let i = 0; i < chatUsers.length; i++) {
					unreaded += chatUsers[i].unreadMessages.length;
				}
			return (unreaded);
		} catch (error) {
			console.log(error)
			return (0);
		}
	}

	async getChatRoomById(roomId: number): Promise<ChatEntity | undefined>
	{
		try {
			const room = await this.chatRepository.findOne({
				relations: ["members", "members.user", "members.unreadMessages"],
				where : {id : roomId}
			});
			return (room);
		} catch (error) {
			return (undefined);
		}
	}

	async deleteRoom(id: number): Promise<void> {
		const room = await this.chatRepository.findOne({where: {id: id}});
		await this.chatRepository.delete(room);
	}
	async leaveRoom(data: ChatRoomI): Promise<ChatEntity | undefined>{

		try {
			const room = await this.chatRepository.findOne({
				relations: ["members", "members.user"],
				where: {id : data.id}
			}) 
			var userToDelete = room.members.find(item => item.user.login == data.me.login);
			room.members = room.members.filter(item => item != userToDelete);
			if (room.members.length == 0){
				await this.deleteRoom(data.id);
				return (undefined);
			}
			if (userToDelete.owner){
				var newOwner = room.members.find(item => !item.banned && !item.muted)
				if (newOwner == undefined)
					if ((newOwner = room.members.find(item => !item.banned)) == undefined)
						newOwner = room.members[0];
				newOwner.admin = true;
				newOwner.owner = true;
				newOwner.banned = false;
				newOwner.muted = false;
				await this.chatUserRepository.save(newOwner);
			}
			await this.deActivateRoom(userToDelete.user, room);
			await this.chatUserRepository.delete(userToDelete);
			return (room);
		} catch (error) {//create response
			console.log(error)
			return (undefined);
		}
	}

	async onBlockUser(room: ChatRoomI, user: UserPublicInfoI): Promise<ChatEntity>{
		const roomEntity = await this.getChatRoomById(room.id);
		const chatUser = roomEntity.members.find(item => item.user.login == user.login);
		chatUser.banned = chatUser.banned ? false : true;
		const ret = await this.chatUserRepository.save(chatUser);
		return (roomEntity);
	}
	async onMuteUser(room: ChatRoomI, user: UserPublicInfoI): Promise<ChatEntity>{
		const roomEntity = await this.getChatRoomById(room.id);
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
					const roomInfo = this.newChatInfo(this.chatName, chatInfo.type);
					const chatMembers =  this.getChatUserEntities(users, this.newChatUserInfo(false));
					room = await this.newChatRoom(chatMembers, roomInfo);
				}
			}
			return (room);
		} catch (error) {
			console.log(error);
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
			chatMembers[0].admin = true;
			chatMembers[0].hasRoomKey = true;
			const room = await this.newChatRoom(chatMembers, channelInfo);
			if ( room === undefined ) 
				return (Response.makeResponse(500, { error: "can't creat channel" }));	
			await this.activateUserRooms(this.chatUserToUserEntity(chatMembers), room);

			var chatUser = room.members.find(member => member.user.id == session.userID.id);
			return (Response.makeResponse(200, this.parseChatRoom(room, chatUser)));
		} catch (error) {
			console.log(error)
			return (Response.makeResponse(500, { error: "can't creat channel" }));
		}
	}
	async unlockRoom(key: RoomKeyI, header: string): Promise<any>{
		const token = header.split(' ')[1]; 
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
			return (Response.makeResponse(200, this.parseChatRoom(room, chatUser)));	
		} catch (error) {
			console.log("errro");
			return (Response.makeResponse(500, { error: "can't unlock room" }));

		}
	}
	async updatePassChannel(channelInfo: ChatPasswordUpdateI, header: string): Promise<any> {
		const token = header.split(' ')[1]; //must check is session is active before continue
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			if (session == undefined)
				return (Response.makeResponse(401, { error: "unauthorized" }));
			var room = await this.getChatRoomById(channelInfo.chatId)
			if (channelInfo.protected &&  await this.hashService.compare(channelInfo.password, room.password))
				return (Response.makeResponse(600, {error : "Can't use same password"}));
			if ((room.protected = channelInfo.protected) && channelInfo.password != undefined)
				room.password =  this.hashService.hash(channelInfo.password);
			if (!room.protected)
				room.password = '';
			room = await this.chatRepository.save(room);
			var chatUser = room.members.find(member => member.user.id == session.userID.id); //owner
			var members = room.members.filter(member => member.user.id != chatUser.user.id); //members
			members = members.map(item => ({ ...item, hasRoomKey: false})); //all members lost room key
			await this.chatUserRepository.save(members); //update members
			return (Response.makeResponse(200, this.parseChatRoom(room, chatUser))); //return parsed room
		} catch (error) {
			return (Response.makeResponse(410, {error: "Cant change password" }));
		}
	}
	async addMemberToChat(room: ChatRoomI, user: UserPublicInfoI): Promise<ChatEntity | undefined>
	{
		try {
			var chatRoom = await this.getChatRoomById(room.id);
			if (chatRoom.members.find(member => member.user.login == user.login) != undefined)
				return (undefined)
			var chatUser = this.getChatUserEntity(user, this.newChatUserInfo(false));
			chatUser.room = chatRoom;
			chatUser.user = await this.userService.findByLogin(user.login);
			chatUser = await this.chatUserRepository.save(chatUser);
			chatRoom.members.push(chatUser);
			chatRoom = await this.chatRepository.save(chatRoom)
			await this.activateUserRooms([chatUser.user], chatRoom);
			return (await this.getChatRoomById(chatRoom.id));
		} catch (error) {
			console.log("error",error);
			return (undefined)
		}
	}

	private searchRoomParser(roomEntity: ChatEntity): SearchRoomI {
		return (<SearchRoomI>{
			id: roomEntity.id,
			name: roomEntity.name,
			type: roomEntity.type,
			protected: roomEntity.protected
		});
	}

	private searchRoomsParser(roomEntity: ChatEntity[]): SearchRoomI[] {
		var rooms: SearchRoomI[] = [];
		for (var i = 0; i < roomEntity.length; i++)
			rooms.push(this.searchRoomParser(roomEntity[i]));
		return (rooms);
	}

	async searchRoom(value: any, header: string): Promise<any>{
		const token = header.split(' ')[1];
		try {
			var myRooms: SearchRoomI[] = [];
			const session = await this.sessionService.findSessionWithRelation(token);
			if (session == undefined)
				return (Response.makeResponse(401, { error: "unauthorized" }));
			const onwRooms = await this.chatUserRepository.find({
				relations: ['room', "unreadMessages"],
				where: [{ user: session.userID, room: {name: Like(value + "%")} }]
			})
			for (var i = 0; i < onwRooms.length; i++) {
				if (onwRooms[i].room.type == eChatType.PRIVATE)
					myRooms.push(this.searchRoomParser(onwRooms[i].room));
			}
			const rooms = await this.chatRepository.find({where: { type: eChatType.PUBLIC, name: Like(value + "%")}});
			myRooms = myRooms.concat(this.searchRoomsParser(rooms));
			return (Response.makeResponse(200, myRooms ));
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, { error: 'Unable to get chats' }));
		}
	}

	async joinRoom(room: any, header: string): Promise<any> {
		const token = header.split(' ')[1];
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			if (session == undefined)
				return (Response.makeResponse(401, { error: "unauthorized" }));
				var chatRoom = await this.getChatRoomById(room.id);
				var chatUser = await this.chatUserRepository.findOne({
					relations: ['room', 'user', 'unreadMessages'],
					where: [{ user: session.userID, room: { id: room.id } }]
				});
				if (chatUser != undefined)
				{
					await this.activateOneUserRoom(session.userID, chatRoom);
					return (Response.makeResponse(200, this.parseChatRoom(chatRoom, chatUser)));
				}
			chatRoom = await this.addMemberToChat(room, session.userID);
			chatUser = chatRoom.members.find(item => item.user.login == session.userID.login);
			if (chatUser == undefined)
				return (Response.makeResponse(500, { error: 'Unable to join chat' }));
			return (Response.makeResponse(200, this.parseChatRoom(chatRoom, chatUser)));
		} catch (error) {
			return (Response.makeResponse(500, { error: 'Unable to join chat' }));
		}
	}

	async changeUserRole(roomId: number, login: string): Promise<ChatEntity> {
		const room = await this.getChatRoomById(roomId);
		const chatUser = room.members.find(item => item.user.login == login);
		if (chatUser.owner)
			return (null);
		chatUser.admin ? (chatUser.admin = false) : (chatUser.admin = true);
		await this.chatUserRepository.save(chatUser);
		return (room);
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
		parsed.admin = me.admin;
		parsed.imBanned = me.banned;
		parsed.imMuted = me.muted;
		parsed.muted = this.chatUserToUserInfo(chatRoom.members.filter(member => member.muted));
		parsed.banned = this.chatUserToUserInfo(chatRoom.members.filter(member => member.banned));
		parsed.admins = this.chatUserToUserInfo(chatRoom.members.filter(member => member.admin));
		parsed.type = chatRoom.type;
		parsed.protected = chatRoom.protected;
		parsed.hasRoomKey = me.hasRoomKey;
		if (me.unreadMessages != undefined)
			parsed.unreadMsg = me.unreadMessages.length;
		if (chatRoom.type != eChatType.DIRECT)
		{
			parsed.name = chatRoom.name;
			parsed.ownerInfo = User.getPublicInfo(chatRoom.members.find(item => item.owner).user);
		}
		else
		{
			parsed.ownerInfo = <UserPublicInfoI>{};
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
			id: msgEntity.id,
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

	private async activateOneUserRoom(user: UserEntity, chatRoom: ChatEntity): Promise<ActiveRoomEntity>{
		var active: ActiveRoomEntity = new ActiveRoomEntity();
		var ret: ActiveRoomEntity;
		active.user = user;
		active.chat = chatRoom;
		const cmpActive = await this.activeRoomRepository.findOne({
			relations: ['chat', 'user'],
			where: {chat: chatRoom.id, user: user.id}
		})
		if (cmpActive == undefined)
			ret = await this.activeRoomRepository.save(active);
		return (ret);
	}

	private async activateUserRooms(users: UserEntity[], chatRoom: ChatEntity): Promise<void>{
		for (var i = 0; i < users.length; i++) {
			await this.activateOneUserRoom(users[i], chatRoom);
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