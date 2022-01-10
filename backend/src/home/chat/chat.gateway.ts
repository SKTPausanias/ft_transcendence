import { WebSocketGateway, SubscribeMessage } from '@nestjs/websockets';
import { SessionService } from 'src/session/session.service';
import { SocketService } from 'src/socket/socket.service';
import { UserService } from '../user/user.service';
import { ChatService } from './chat.service';
import { eChat } from './eChat';
import { ChatEntity } from './entities/chat.entity';
import { MessagesI } from './iChat';

@WebSocketGateway({ cors: true })
export class ChatGateway {
	server: any;
	constructor(private socketService: SocketService,
				private chatService: ChatService,
				private sessionService: SessionService,
				private userService: UserService){}
	init(server: any){
		this.server = server;
	}
	
	@SubscribeMessage(eChat.ON_START)
	async onStart(client, data) {
		const me = await this.getSessionUser(client);
		const resp = await this.chatService.onStart(me, data.members, data.chatInfo);
		await this.server.to(client.id).emit(eChat.ON_START, me.login, resp);
	}
	@SubscribeMessage(eChat.ON_JOIN_ROOM)
	async onJoinRoom(client, data) {
		//Used when user join's the room
	}
	@SubscribeMessage(eChat.ON_LEAVE_ROOM)
	async onLeaveRoom(client, data) {
		try {
			const room = await this.chatService.leaveRoom(data);
			if (room != undefined && room.members != undefined)
				await this.emitRoomUpdateToAll(room, data.me.login, false);
			await this.socketService.emitToSelf(this.server, eChat.ON_LEAVE_ROOM, data.me.login, data);
		} catch (error) {
			console.log("<error> onLeaveRoom:", error);
		}
	}

	@SubscribeMessage(eChat.ON_LOAD_ACTIVE_ROOMS)
	async onLoadActiveRooms(client) {
		try {
			const me = await this.getSessionUser(client);
			const rooms = await this.chatService.getActiveChatRooms(me);
			await this.socketService.emitToSelf(this.server, eChat.ON_LOAD_ACTIVE_ROOMS, me.login ,rooms);
		} catch (error) {}
	}
	@SubscribeMessage(eChat.ON_All_MSG)
	async getAllMsg(client, data) {
		try {
			const me = await this.getSessionUser(client);
			const resp = await this.chatService.getAllMessages(data);
			await this.server.to(client.id).emit(eChat.ON_All_MSG, me.login, resp);
			const unreaded = await this.chatService.markAsReaded(me, data.room);
			console.log("unreaded: ", unreaded);
			await this.socketService.emitToSelf(this.server, eChat.ON_GET_UNREAD_MSG, me.login ,unreaded);
			const room = await this.chatService.getChatRoomById(data.room.id);
			await this.emitRoomUpdateToAll(room, me.login, true);
		} catch (error) {
			console.log(error);
		}
	}
	@SubscribeMessage(eChat.ON_NEW_MSG)
	async onNewMsg(client, data) {
		try {
			const me = await this.getSessionUser(client);
			const resp = await this.chatService.newMessage(me, data);
			await this.socketService.emitToAll(this.server, eChat.ON_NEW_MSG, me.login, resp.emitTo, resp.message);
		} catch (error) {}
	}
	@SubscribeMessage(eChat.ON_READ_MSG)
	async onReadMsg(client, data: MessagesI) {
		try {
			const me = await this.getSessionUser(client);
			var room = await this.chatService.getChatRoomById(data.chatId);
			const chatMe = room.members.find(item => item.user.id == me.id);
			const unreaded = await this.chatService.markAsReaded(me, this.chatService.parseChatRoom(room, chatMe));
			room = await this.chatService.getChatRoomById(data.chatId);
			this.server.to(client.id).emit(eChat.ON_GET_UNREAD_MSG, me.login, unreaded);
			await this.emitRoomUpdateToAll(room, me.login, true);
		} catch (error) {}
	}
	@SubscribeMessage(eChat.ON_GET_UNREAD_MSG)
	async onGetUnreadMessages(client, roomId) {
		try {
			const me = await this.getSessionUser(client);
			const unreaded = await this.chatService.getUnreadedMsg(me);
			this.server.to(client.id).emit(eChat.ON_GET_UNREAD_MSG, me.login, unreaded);
			if (roomId != undefined)
			{
				var room = await this.chatService.getChatRoomById(roomId);
				await this.emitRoomUpdateToAll(room, me.login, true);
			}
		} catch (error) {}
	}
	@SubscribeMessage(eChat.ON_BLOCK_USER)
	async onBlockUser(client, data) {
		try
		{
			const me = await this.getSessionUser(client);
			const room = await this.chatService.onBlockUser(data.room, data.user);
			await this.emitRoomUpdateToAll(room, me.login, false);
		}
		catch(error) {}
	}
	@SubscribeMessage(eChat.ON_MUTE_USER)
	async onMuteUser(client, data) {
		try
		{
			const me = await this.getSessionUser(client);
			const room = await this.chatService.onMuteUser(data.room, data.user);
			await this.emitRoomUpdateToAll(room, me.login, false);
		}
		catch(error) {}
	}
	@SubscribeMessage(eChat.ON_ADD_MEMBER_TO_CHAT)
	async onAddMemberToChat(client, data) {
		const me = await this.getSessionUser(client);
		const room = await this.chatService.addMemberToChat(data.room, data.member);
		await this.emitRoomUpdateToAll(room, me.login, false);
	}
	
	@SubscribeMessage(eChat.ON_UPDATE_ROOM)
	async onUpdateRoom(client, data) {
		var id;
		data.room.id != undefined ? (id = data.room.id) : (id = data.room.chatId);
		const me = await this.getSessionUser(client);
		const room = await this.chatService.getChatRoomById(id);
		if (room != undefined)
			await this.emitRoomUpdateToAll(room, me.login, false);
	}
	@SubscribeMessage(eChat.ON_CHANGE_ROLE)
	async onChangeRole(client, data) {
		const me = await this.getSessionUser(client);
		const room = await this.chatService.changeUserRole(data.roomId, data.user);
		if (room)
			await this.emitRoomUpdateToAll(room, me.login, false)
	}


	async goOnlineOffline(login: string){
		console.log(login, " now is offline");;

	}

	async emitRoomUpdateToAll(room: ChatEntity, me: string, selfOnly: boolean){
		if (room != undefined && room.members != undefined){
			for (let i = 0; i < room.members.length; i++) {
				const member = room.members[i];
				if (selfOnly && member.user.login != me)
					continue ;
				const parsedRoom = this.chatService.parseChatRoom(room, member);
				await this.socketService.emitToOne(this.server, eChat.ON_UPDATE_ROOM, me, member.user, parsedRoom);
			}
		}
	}

	private async getSession(client: any)
	{
		try {
			const token = client.handshake.headers.authorization.split(' ')[1];
			const session = await this.sessionService.findSessionWithRelation(token);
			return (session);
		} catch (error) {}
	}
	private async getSessionUser(client: any)
	{
		const session = await this.getSession(client);	
		return (session.userID);	
	}
}