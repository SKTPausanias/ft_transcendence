import { WebSocketGateway, SubscribeMessage } from '@nestjs/websockets';
import { SessionService } from 'src/session/session.service';
import { SocketService } from 'src/socket/socket.service';
import { ChatService } from './chat.service';
import { eChat } from './eChat';

@WebSocketGateway({ cors: true })
export class ChatGateway {
	server: any;
	constructor(private socketService: SocketService,
				private chatService: ChatService,
				private sessionService: SessionService){}
	init(server: any){
		this.server = server;
	}
	
	@SubscribeMessage(eChat.ON_START)
	async onStart(client, data) {
		try {
			const me = await this.getSessionUser(client);
			const resp = await this.chatService.onStart(me, data.members, data.name);
			await this.socketService.emitToSelf(this.server, eChat.ON_START, me.login ,resp);
		} catch (error) {}
	}
	@SubscribeMessage(eChat.ON_JOIN_ROOM)
	async onJoinRoom(client, data) {
		try {
			const session = await this.getSession(client);
			const room = await this.chatService.getChatRoomById(session.userID, data);
			console.log("join room: ", session.socket_id);
			this.server.to(session.socket_id).emit(eChat.ON_JOIN_ROOM, room);
			//await this.socketService.emitToOneSession(this.server, eChat.ON_JOIN_ROOM, session.token ,room);
		} catch (error) {
			console.log(error);
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
			const resp = await this.chatService.getMessages(data);
			await this.socketService.emitToSelf(this.server, eChat.ON_All_MSG, me.login ,resp);
		} catch (error) {}
	}
	@SubscribeMessage(eChat.ON_NEW_MSG)
	async onNewMsg(client, data) {
		try {
			const me = await this.getSessionUser(client);
			const resp = await this.chatService.newMessage(me, data);
			data.room.members.push(data.room.me);
			await this.socketService.emitToAll(this.server, eChat.ON_NEW_MSG, me.login, data.room.members, resp);
		} catch (error) {}
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