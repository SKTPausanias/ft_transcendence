import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatGateway } from 'src/home/chat/chat.gateway';
import { FriendService } from 'src/home/friends/friend.service';
import { PlayGateway } from 'src/home/play/play.gateway';
import { UserService } from 'src/home/user/user.service';
import { User } from 'src/home/user/userClass';
import { SessionService } from 'src/session/session.service';
import { wSocket } from 'src/socket/eSocket';
import { SocketService } from './socket.service';
  

@WebSocketGateway({ cors: true })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(private socketService: SocketService,
				private chatGateway: ChatGateway,
				private playGateway: PlayGateway,
				private userService: UserService,
				private sessionService: SessionService,
				private friendService: FriendService){}
	//sockets: wSocketI[] = [];
	clientsConnected = 0;
	@WebSocketServer() server;
	async handleConnection(client) {
		try {
			this.chatGateway.init(this.server);
			this.playGateway.init(this.server);
			//init game gatway

			const sessionData = await this.getSessionData(client);
			await this.socketService.emitToAllFriends(
				this.server, wSocket.USER_UPDATE, sessionData.userInfo.login, 
				sessionData.friends, User.getPublicInfo(sessionData.userInfo));
				this.server.to(client.id).emit(wSocket.SESSION_INIT, sessionData);

				await this.chatGateway.goOnlineOffline(sessionData.userInfo.login);
				console.log("Connected: there are ", ++this.clientsConnected, " clients connected!: ", client.id);
			} catch (error) {
				console.error(error);
				this.server.to(client.id).emit(wSocket.FORCE_DISCONNECT);
			}
		}
	async handleDisconnect(client) {
		console.log("Disconnected: there are ", --this.clientsConnected, " clients connected");
	}
	@SubscribeMessage(wSocket.SESSION_INIT)
	async handshake(client, message) {
		//console.log(SocketClass.findSocket(this.sockets, client.id).session.userID.nickname, " : ", message);

	}
	@SubscribeMessage(wSocket.USER_UPDATE)
	async friendConnect(client, message) {
		const sessionData = await this.getSessionData(client);
		await this.socketService.emitToAllFriends(
				this.server, wSocket.USER_UPDATE, sessionData.userInfo.login,
				sessionData.friends, User.getPublicInfo(sessionData.userInfo));
		await this.socketService.emitToSelf(
				this.server, wSocket.USER_UPDATE, 
				sessionData.userInfo.login, sessionData.userInfo);
	}
	@SubscribeMessage(wSocket.FRIEND_INVITATION)
	async friendInvitation(client, friend) {
		const sessionData = await this.getSessionData(client);
		await this.socketService.emitToOneFriend(this.server, wSocket.FRIEND_INVITATION,
						sessionData.userInfo.login, friend, User.getPublicInfo(sessionData.userInfo));
	}
	@SubscribeMessage(wSocket.FRIEND_ACCEPT)
	async friendAccept(client, friend) {
		const sessionData = await this.getSessionData(client);
		await this.socketService.emitToOneFriend(this.server, wSocket.FRIEND_ACCEPT,
						sessionData.userInfo.login, friend, User.getPublicInfo(sessionData.userInfo));
		await this.socketService.emitToSelf(this.server, wSocket.FRIEND_ACCEPT,
				sessionData.userInfo.login, friend);
	}
	@SubscribeMessage(wSocket.FRIEND_DELETE)
	async friendDelete(client, friend) {
		const sessionData = await this.getSessionData(client);
		await this.socketService.emitToOneFriend(this.server, wSocket.FRIEND_DELETE,
						sessionData.userInfo.login, friend, User.getPublicInfo(sessionData.userInfo));
		await this.socketService.emitToSelf(this.server, wSocket.FRIEND_DELETE,
				sessionData.userInfo.login, friend);
	}
	@SubscribeMessage(wSocket.USER_DELETE)
	async userDelete(client, data) {
		await this.socketService.emitToAllFriends(this.server, wSocket.USER_DELETE, data.emiter, data.friends, data.friends)
	}
	@SubscribeMessage(wSocket.CONNECT_USER)
	async userConnect(client) {
		
	}
	
	@SubscribeMessage(wSocket.DISCONNECT_USER)
	async userDiconnect(client) {
		const token = client.handshake.headers.authorization.split(' ')[1];
		const session = await this.sessionService.findSessionWithRelation(token);
		const friends = await this.friendService.findAllFriends(session.userID);
		await this.sessionService.removeByToken(token);
		const sessions = await this.sessionService.findByUser(session.userID);
		if (!sessions.length)
		{
			session.userID.online = false;
			await this.userService.save(session.userID);
			await this.socketService.emitToAllFriends(this.server, wSocket.USER_UPDATE, session.userID.login, 
				friends, User.getPublicInfo(session.userID));
			await this.chatGateway.goOnlineOffline(session.userID.login);
		}
		this.server.to(client.id).emit(wSocket.FORCE_DISCONNECT);
	}

	private async getSessionData(client: any){
		const token = client.handshake.headers.authorization.split(' ')[1];
		return (await this.socketService.getSessionData(token, client.id));
	}
}
