import { FriendEntity } from "src/home/friends/friend.entity";
import { UserEntity } from "src/home/user/user.entity";
import { User } from "src/home/user/userClass";
import { UserPublicInfoI } from "src/home/user/userI";
import { SessionEntity } from "src/session/session.entity";
import { SessionI } from "src/session/sessionI";
import { wSocket } from "./eSocket";
import { SessionDataI, wSocketI } from "./iSocket";

export class SocketClass implements wSocketI{

	me: UserEntity = <UserEntity>{};
	socket_id: string;
	session: SessionI;
	session_data: SessionDataI = <SessionDataI>{};
	constructor(clientId: string, session: SessionEntity, friends: UserEntity[]){
		this.me = session.userID;
		this.socket_id = clientId;
		this.session = session;
		this.session_data.userInfo = User.getInfo(session.userID);
		this.session_data.friends = friends;
	}

	remove(sockets: wSocketI[]) : wSocketI[]{
		const ret = sockets.filter(obj => obj.socket_id !== this.socket_id);
		const other = this.findSocketByNickname(ret, this.session.userID.nickname);
		if (other === undefined)
			this.session.userID.online = false;
		return (ret);
	} 
	onChange(action: string, server: any, sockets: wSocketI[]){
		this.session_data.friends.forEach(element => {
			var friends = this.findAllSocketsByNickname(sockets, element.nickname);
			if (friends !== undefined)
				friends.forEach(friend => {
					server.to(friend.socket_id).emit(action, this.me.nickname, User.getPublicInfo(this.session.userID));
				});
		});
		this.me = this.session.userID;
	} 
	private findSocketByNickname(sockets: wSocketI[], nickname: string){
		return (sockets.find(sck => sck.session.userID.nickname === nickname));
	}
	private findAllSocketsByNickname(sockets: wSocketI[], nickname: string){
		return (sockets.filter(obj => obj.session.userID.nickname.indexOf(nickname) !== -1));
	}
	public static findSocket(sockets: wSocketI[], clientId: string){
		return (sockets.find(sck => sck.socket_id === clientId));
	}
	public static findSocketBySession(sockets: wSocketI[], token: string){
		return (sockets.find(sck => sck.session.token === token));
	}
}