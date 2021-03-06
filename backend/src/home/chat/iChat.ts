import { UserEntity } from "../user/user.entity";
import { UserPublicInfoI } from "../user/userI";

export interface ChatRoomI {
	id: number;
	name: string;
    me: UserPublicInfoI;
	img: string | undefined;
	members: UserPublicInfoI[];
	imBanned: boolean;
	imMuted: boolean;
	banned: UserPublicInfoI[];
	owner: boolean;
	ownerInfo: UserPublicInfoI;
	admin: boolean;
    muted: UserPublicInfoI[];
    admins: UserPublicInfoI[];
	onlineStatus: boolean;
	type: string;
	protected: boolean;
	hasRoomKey: boolean;
	unreadMsg: number;
}
export interface MessagesI {
	id: number,
	chatId: number,
	owner: UserPublicInfoI,
	message: string,
	timeStamp: string
}

export interface ChatInfoI{
	name: string | undefined, 
	type: string,
	password: string | undefined,
	owner: boolean,
	baned: boolean,
	muted: boolean
}

export interface ChatUserI {
	owner: boolean,
	baned: boolean,
	muted: boolean,	
}

export interface ChatI {
    name: string,
    type: string,
    password: string,
    protected: boolean,
	members: UserPublicInfoI[]
}
export interface NewMessageI {
	emitTo : UserEntity[],
	message: MessagesI
}
export interface RoomKeyI{
	id: number;
	password: string;
}
export interface ChatPasswordUpdateI {
    chatId: number,
    protected: boolean,
    password: string
}
export interface SearchRoomI {
	id: number,
	name: string,
	type: string,
	protected: boolean
}
