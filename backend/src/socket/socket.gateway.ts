import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { FriendService } from 'src/home/friends/friend.service';
import { UserEntity } from 'src/home/user/user.entity';
import { User } from 'src/home/user/userClass';
import { SessionService } from 'src/session/session.service';
import { SessionI } from 'src/session/sessionI';
import { wSocket } from 'src/socket/eSocket';
import { SocketClass } from './cSocket';
import { SessionDataI, wSocketI } from './iSocket';
  

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
			const sck = new SocketClass(client.id, session, friends);
			this.sockets.push(sck);
			sck.onChange(wSocket.USER_UPDATE, this.server, this.sockets);
			this.server.to(client.id).emit(wSocket.SESSION_INIT, sck.session_data);
			console.log("Connected: there are ", this.sockets.length, " clients connected: ", client.id);
		} catch (error) {
			console.error(error);
			this.server.emit('force-disconnect');
		}
	}
	async handleDisconnect(client) {
		var sck = SocketClass.findSocket(this.sockets, client.id);
		this.sockets = sck.remove(this.sockets);
		sck.onChange(wSocket.USER_UPDATE, this.server, this.sockets);
		console.log("Disconnected: there are ", this.sockets.length, " clients connected");
	}
	@SubscribeMessage(wSocket.SESSION_INIT)
	async handshake(client, message) {
		console.log(SocketClass.findSocket(this.sockets, client.id).session.userID.nickname, " : ", message);

	}
	@SubscribeMessage(wSocket.USER_UPDATE)
	async friendConnect(client, message) {
		console.log(SocketClass.findSocket(this.sockets, client.id).session.userID.nickname, " : ", message);
	}

	public emitUserUpdate(action: string, session: SessionI)
	{
		const sck = SocketClass.findSocketBySession(this.sockets, session.token);
		sck.session_data.friends = sck.session_data.friends;
		sck.session_data.userInfo = User.getInfo(session.userID);
		sck.session = session;
		sck.onChange(action, this.server, this.sockets);
	}
}
