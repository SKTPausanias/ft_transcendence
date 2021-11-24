import { WebSocketGateway, SubscribeMessage } from '@nestjs/websockets';
import { SessionService } from 'src/session/session.service';
import { SocketService } from 'src/socket/socket.service';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ChatService } from './chat.service';
import { eChat } from './eChat';

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
		await this.chatService.onStart(me, data.members, data.name);

		this.server.to(client.id).emit('test', "Testing...")
	}
	@SubscribeMessage(eChat.ON_JOIN_ROOM)
	async onJoinRoom(client, data) {
	
	}
	@SubscribeMessage(eChat.ON_LEAVE_ROOM)
	async onLeaveRoom(client, data) {
		
	}
	@SubscribeMessage(eChat.ON_LOAD_ACTIVE_ROOMS)
	async onLoadActiveRooms(client) {
	
	}
	@SubscribeMessage(eChat.ON_All_MSG)
	async getAllMsg(client, data) {
		
	}
	@SubscribeMessage(eChat.ON_NEW_MSG)
	async onNewMsg(client, data) {
		
	}
	@SubscribeMessage(eChat.ON_BLOCK_USER)
	async onBlockUser(client, data) {
	
	}


	async goOnlineOffline(login: string){
		
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