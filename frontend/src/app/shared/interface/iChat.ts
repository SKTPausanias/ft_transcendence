import { UserInfoI, UserPublicInfoI } from "./iUserInfo";

export interface ChatRoomI {
	id: number;
	name: string;
    me: UserPublicInfoI;
	img: string | undefined;
	members: UserPublicInfoI[];
	banned: UserPublicInfoI[];
	imBanned: boolean;
	imMuted: boolean;
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

export interface ChatI {
    name: string,
    type: string
    protected: boolean,
    password: string,
    members: UserInfoI[]
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

export interface UnreadedMessagesI{
	unreaded : [
		{
			login: string,
			roomIdf : number
		}
	]
}
export interface SearchRoomI {
	id: number,
	name: string,
	type: string,
	protected: boolean
}

/**
 * On recive msg unreaded.push({login, roomID})
 * Si usuario esta en la sala se quita todas quincidencias con su login y roomId de unreaded
 */

