import { UserPublicInfoI } from "./iUserInfo";

export interface ChatRoomI {
    id: number,
	type: string,
	members: UserPublicInfoI[],
	blocked: boolean
}
export interface MessagesI {
    message: string,
    timeStamp: string,
    owner: UserPublicInfoI,
  }
