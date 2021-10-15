import { FriendEntity } from "src/home/friends/friend.entity";
import { SessionEntity } from "src/session/session.entity";

export interface wSocketI {
	socket_id: string,
	session: SessionEntity,
	friends: FriendEntity[]
}