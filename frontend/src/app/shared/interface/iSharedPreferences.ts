import { UserInfoI } from "../ft_interfaces";
import { MessagesI } from "./iChat";
import { UserPublicInfoI } from "./iUserInfo";

export interface SharedPreferencesI {
	path: string,
	userInfo : UserInfoI;
	friends : UserPublicInfoI[];
	friend_invitation: UserPublicInfoI[];
	expandRightNav : boolean;
	chat: {
		active_room: any;
	 	rooms: any[];
	}
	unreaded_messages: number;
}