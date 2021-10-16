import { FriendEntity } from "src/home/friends/friend.entity";
import { SessionEntity } from "src/session/session.entity";
import { UserInfoI, UserPublicInfoI } from "src/home/user/userI"
import { SessionI } from "src/session/sessionI";
import { UserEntity } from "src/home/user/user.entity";
export interface wSocketI {
	socket_id: string,
	session: SessionEntity,
	session_data: SessionDataI,
	remove(sockets: wSocketI[]): any,
	onChange(action: string, server: any, sockets: wSocketI[]): any
}

export interface SessionDataI {
	userInfo : UserInfoI;
	friends : UserPublicInfoI[];
}
