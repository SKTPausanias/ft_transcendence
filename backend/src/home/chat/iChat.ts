import { UserEntity } from "../user/user.entity";
import { UserPublicInfoI } from "../user/userI";

export interface ChatRoomI {
	id: number;
	name: string;
    me: UserPublicInfoI;
	img: string | undefined;
	members: UserPublicInfoI[];
	banned: UserPublicInfoI[];
	owner: boolean;
    muted: UserPublicInfoI[];
	onlineStatus: boolean;
	type: string;
	protected: boolean;

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
