import { UserInfoI, UserPublicInfoI } from "./iUserInfo";

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

