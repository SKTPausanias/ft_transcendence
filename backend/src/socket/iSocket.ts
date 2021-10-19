import { SessionEntity } from "src/session/session.entity";
import { UserInfoI, UserPublicInfoI } from "src/home/user/userI"
import { FriendEntity } from "src/home/friends/friend.entity";

export interface wSocketI {
	socket_id: string,
	session: SessionEntity,
	session_data: SessionDataI,
	remove(sockets: wSocketI[]): any,
	onChange(action: string, server: any, sockets: wSocketI[]): any,
	emitToOne(action: string, server: any, sockets: wSocketI[], receiver: string, data: any);
	onDeleteAccount(server: any, sockets: wSocketI[], friends: UserPublicInfoI[]);

	//emitToFriends();
	//emitToAll();
}

export interface SessionDataI {
	userInfo : UserInfoI;
	friends : UserPublicInfoI[];
	friend_invitation: UserPublicInfoI[]

}

