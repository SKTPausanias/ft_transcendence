import { UserEntity } from "../user/user.entity";
import { UserPublicInfoI } from "../user/userI";

export interface ChatRoomI {
	id: number;
	name: string;
    me: UserPublicInfoI;
	img: string | undefined;
	members: UserPublicInfoI[];
	banned: boolean;
	owner: boolean;
    muted: boolean;

}
export interface MessagesI {
	chatId: number,
	owner: UserPublicInfoI,
	message: string,
	timeStamp: string
}

export interface ChatInfoI{
	name: string | undefined, 
	type: string,
	pwd: string | undefined,
	owner: boolean,
	baned: boolean,
	muted: boolean
}
export interface NewMessageI {
	emitTo : UserEntity[],
	message: MessagesI
}
