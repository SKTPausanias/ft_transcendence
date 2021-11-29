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
	hasRoomKey: boolean;
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

/**
 * On recive msg unreaded.push({login, roomID})
 * Si usuario esta en la sala se quita todas quincidencias con su login y roomId de unreaded
 */

