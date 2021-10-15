import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { FriendService } from 'src/home/friends/friend.service';
import { SessionService } from 'src/session/session.service';
import { wSocket } from 'src/socket/eSocket';
import { SocketClass } from './cSocket';
import { wSocketI } from './iSocket';
  

@WebSocketGateway({ cors: true })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(private sessionService: SessionService,
				private friendService: FriendService){}
	sockets: wSocketI[] = [];
	@WebSocketServer() server;
	async handleConnection(client) {
		try {
			const token = client.handshake.headers.authorization.split(' ')[1];
			const session = await this.sessionService.findSessionWithRelation(token);
			const friends = await this.friendService.findAllFriends(session.userID);
			this.sockets.push(SocketClass.newSocketCLient(client.id, session, friends));
			console.log("Connected: there are ", this.sockets.length, " client connected");
			SocketClass.sayHello(this.server, this.sockets, client.id);
		} catch (error) {
			console.error(error);
			this.server.emit('force-disconnect');
		}
	}
	async handleDisconnect(client) {
		SocketClass.sayBye(this.server, this.sockets, client.id);
		this.sockets = SocketClass.removeSocketClientBySocketId(this.sockets, client.id);
		console.log("Disconnected: there are ", this.sockets.length, " client connected");
	}
	@SubscribeMessage(wSocket.TEST)
	async handshake(client, message) {
		console.log(SocketClass.findSocket(this.sockets, client.id).session.userID.nickname, " : ", message);

	}
	@SubscribeMessage(wSocket.FRIEND_CONNECT)
	async friendConnect(client, message) {
		//SocketClass.sayHello(this.server, this.sockets, client.id);
		console.log(SocketClass.findSocket(this.sockets, client.id).session.userID.nickname, " : ", message);
	}
	@SubscribeMessage(wSocket.FRIEND_DISCONNECT)
	async friendDisonnect(client, message) {
		//SocketClass.sayBye(this.server, this.sockets, client.id);
		console.log(SocketClass.findSocket(this.sockets, client.id).session.userID.nickname, " : ", message);

	}
}
