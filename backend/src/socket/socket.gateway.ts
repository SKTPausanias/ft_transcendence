import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { User } from 'src/home/user/userClass';
import { wSocket } from 'src/socket/eSocket';
import { SocketService } from './socket.service';
import { UserService } from 'src/home/user/user.service';
  

@WebSocketGateway({ cors: true })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(private socketService: SocketService,
		private userService: UserService,
		){}
	//sockets: wSocketI[] = [];
	clientsConnected = 0;
	@WebSocketServer() server;
	async handleConnection(client) {

		try {
			const sessionData = await this.getSessionData(client);
			await this.socketService.emitToAllFriends(
				this.server, wSocket.USER_UPDATE, sessionData.userInfo.login, 
				sessionData.friends, User.getPublicInfo(sessionData.userInfo));
				this.server.to(client.id).emit(wSocket.SESSION_INIT, sessionData);
				console.log("Connected: there are ", ++this.clientsConnected, " clients connected!: ", client.id);
			} catch (error) {
				console.error(error);
				this.server.emit('force-disconnect');
			}
		}
	async handleDisconnect(client) {
		const sessionData = await this.getSessionData(client);
		sessionData.userInfo.online = false;
		await this.socketService.emitToAllFriends(
			this.server, wSocket.USER_UPDATE, sessionData.userInfo.login, 
			sessionData.friends, User.getPublicInfo(sessionData.userInfo));
/* 	var sck = SocketClass.findSocket(this.sockets, client.id);
	this.sockets = sck.remove(this.sockets);
	sck.onChange(wSocket.USER_UPDATE, this.server, this.sockets); */
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
	private async getSessionData(client: any){
		const token = client.handshake.headers.authorization.split(' ')[1];
		return (await this.socketService.getSessionData(token, client.id));
	}
	
	@SubscribeMessage(wSocket.CHAT_MESSAGE)
	async chatMessage(client, data) {
		const sessionData = await this.getSessionData(client);
		console.log(sessionData.userInfo.login, " : ", data);
		console.log(data.receiver);
		//const friend = await this.userService.findByNickname(user.nickname); // sacar amigo para llamar a la funcion de emitToOneFriend
		const friend = await this.userService.findByNickname(data.receiver);
		await this.socketService.emitToOneFriend(this.server, wSocket.CHAT_MESSAGE, sessionData.userInfo.login, friend, data.message);
		await this.socketService.emitToSelf(this.server, wSocket.CHAT_MESSAGE, sessionData.userInfo.login, data.message);
		//this.server.emit(wSocket.CHAT_MESSAGE, sessionData.userInfo.login, message);
		//await this.socketService.emitToAllFriends(this.server, wSocket.CHAT_MESSAGE,
		//		sessionData.userInfo.login, sessionData.friends, data.message);
	}

	@SubscribeMessage(wSocket.GAME_POSITION)
	async moveBall(client, data)
	{
		//const sessionData = await this.getSessionData(client);
		switch(data.direction) {
            case "left":
                data.x -= 5;
               this.server.emit(wSocket.GAME_POSITION, data);
                break;
            case "right":
                data.x += 5;
               this.server.emit(wSocket.GAME_POSITION, data);
                break;
            case "up":
                data.y -= 5;
               this.server.emit(wSocket.GAME_POSITION, data);
                break;
            case "down":
                data.y += 5;
               this.server.emit(wSocket.GAME_POSITION, data);
                break;
			default:
				this.server.emit(wSocket.GAME_POSITION, data);
				break;
        }
	}
}
