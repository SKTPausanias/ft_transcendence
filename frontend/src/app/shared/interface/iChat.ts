import { UserInfoI, UserPublicInfoI } from "./iUserInfo";

export interface ChatRoomI {
	id: number;
	name: string;
    me: UserPublicInfoI;
	img: string | undefined;
	members: UserPublicInfoI[];
	banned: boolean;
	owner: boolean;
    muted: boolean;
	onlineStatus: boolean;
	type: string;
}
export interface MessagesI {
    message: string,
    timeStamp: string,
    owner: UserPublicInfoI,
}

export interface ChatI {
    name: string,
    type: string
    protected: boolean,
    password: string,
    members: UserInfoI[]
}

