import { UserPublicInfoI } from "../user/userI";

export interface ChatRoomI {
	id: number;
	name: string;
    me: UserPublicInfoI;
	img: string | undefined;
	members: UserPublicInfoI[];
	blocked: boolean;

}
export interface MessagesI {
	chatId: number,
	owner: UserPublicInfoI,
	message: string,
	timeStamp: string
}