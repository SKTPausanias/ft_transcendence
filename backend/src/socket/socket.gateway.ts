import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { FriendEntity } from 'src/home/friends/friend.entity';
import { FriendService } from 'src/home/friends/friend.service';
import { UserEntity } from 'src/home/user/user.entity';
import { User } from 'src/home/user/userClass';
import { UserPublicInfoI } from 'src/home/user/userI';
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
			const friendInvitations = await this.friendService.findAllInvitations(session.userID);
			const sck = new SocketClass(client.id, session, friends, friendInvitations);
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
	public emitFriendNotification(session: SessionI, newFriendship: UserPublicInfoI)
	{
		const sck = SocketClass.findSocketBySession(this.sockets, session.token);
		sck.emitToOne(wSocket.FRIEND_INVITATION, this.server, this.sockets, newFriendship.nickname, User.getPublicInfo(session.userID));
	}
	public emitFriendConfiramtion(session: SessionI, newFriendship: UserPublicInfoI)
	{
		const sck = SocketClass.findSocketBySession(this.sockets, session.token);
		sck.session_data.friends.push(newFriendship);
		console.log("friend size after confirm: ", sck.session_data.friends.length);
		sck.emitToOne(wSocket.FRIEND_ACCEPT, this.server, this.sockets, newFriendship.nickname, User.getPublicInfo(session.userID));
		this.server.to(sck.socket_id).emit(wSocket.FRIEND_ACCEPT, newFriendship);	
	}
	public emitFriendRemove(session: SessionI, friend: UserPublicInfoI){
		const sck = SocketClass.findSocketBySession(this.sockets, session.token);
		sck.session_data.friends = sck.session_data.friends.filter(obj => obj.nickname !== friend.nickname);
		sck.emitToOne(wSocket.FRIEND_DELETE, this.server, this.sockets, friend.nickname, User.getPublicInfo(session.userID));
		this.server.to(sck.socket_id).emit(wSocket.FRIEND_DELETE, friend);	
	}
	public emitDeleteAccount(session: SessionI, friends: UserPublicInfoI[]){
		const sck = SocketClass.findSocketBySession(this.sockets, session.token);
		sck.onDeleteAccount(this.server, this.sockets, friends);
		/* sck.emitToOne(wSocket.FRIEND_DELETE, this.server, this.sockets, friend.nickname, User.getPublicInfo(session.userID));
		this.server.to(sck.socket_id).emit(wSocket.FRIEND_DELETE, friend);	 */
	}


	
}
