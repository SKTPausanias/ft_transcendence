import { FriendEntity } from "src/home/friends/friend.entity";
import { SessionEntity } from "src/session/session.entity";
import { SessionI } from "src/session/sessionI";
import { wSocket } from "./eSocket";
import { wSocketI } from "./iSocket";

export class SocketClass{

	static newSocketCLient(clientId: string, sessionToken: SessionEntity, friends: FriendEntity[]){
		let socket = <wSocketI>{};
		socket.socket_id = clientId;
		socket.session = sessionToken;
		socket.friends = friends;
		return (socket)
	}
	
	//callback example
	static remove(sockets: wSocketI[], socket_id: string, callback: (sockets: wSocketI[])  => any) : void{
		callback (sockets.filter(obj => obj.socket_id !== socket_id));
	} 
	static removeSocketClientBySocketId(sockets: wSocketI[], clientId: string){
		return (sockets.filter(obj => obj.socket_id !== clientId));
	}
	static findSocket(sockets: wSocketI[], clientId: string){
		return (sockets.find(sck => sck.socket_id === clientId));
	}
	static findSocketBySession(sockets: wSocketI[], id: number){
		return (sockets.find(sck => sck.session.userID.id === id));
	}
	static sayHello(server: any, sockets: wSocketI[], clientId: string)
	{
		var sock = this.findSocket(sockets, clientId);
		sock.friends.forEach(element => {
			var friend = this.findSocketBySession(sockets, element.id)
			if (friend !== undefined)
				server.to(friend.socket_id).emit(wSocket.FRIEND_CONNECT, "your friend [" + sock.session.userID.nickname + "] just connected")
		});
	}
	static sayBye(server: any, sockets: wSocketI[], clientId: string)
	{
		var sock = this.findSocket(sockets, clientId);
		sock.friends.forEach(element => {
			var friend = this.findSocketBySession(sockets, element.id)
			if (friend !== undefined)
				server.to(friend.socket_id).emit(wSocket.FRIEND_DISCONNECT, "your friend [" + sock.session.userID.nickname + "] just disconnected")
		});
	}
}