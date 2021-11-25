import { UserPublicInfoI } from "./iUserInfo";

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
    message: string,
    timeStamp: string,
    owner: UserPublicInfoI,
  }
