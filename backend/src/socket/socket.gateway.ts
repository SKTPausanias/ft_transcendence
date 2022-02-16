import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatGateway } from 'src/home/chat/chat.gateway';
import { FriendService } from 'src/home/friends/friend.service';
import { ePlay } from 'src/home/play/ePlay';
import { PlayGateway } from 'src/home/play/play.gateway';
import { PlayService } from 'src/home/play/play.service';
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
				private playService: PlayService,
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
				console.log("_connectionKey: ", this.server.httpServer._connectionKey);
				console.log("onConnect(): engine : ", this.server.sockets.adapter.rooms);
				console.log("onConnect(): Client count : ", this.server.engine.clientsCount);
				++this.clientsConnected;
			} catch (error) {
				console.error(error);
				this.server.to(client.id).emit(wSocket.FORCE_DISCONNECT);
			}
		}
	async handleDisconnect(client) { //set another way of counting users: This is not a good way
		--this.clientsConnected;
		console.log("onDisconect(): Client count : ", this.server.engine.clientsCount);

	}
	//What does it do???... if not neccessary, delete it
	@SubscribeMessage(wSocket.SESSION_INIT)
	async handshake(client, message) {}

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
		}
		await this.server.emit(ePlay.ON_GET_INFO_SYSTEM, await this.playService.getInfoSystem());
		await this.server.to(client.id).emit(wSocket.FORCE_DISCONNECT);
	}

	private async getSessionData(client: any){
		const token = client.handshake.headers.authorization.split(' ')[1];
		return (await this.socketService.getSessionData(token, client.id));
	}
}
