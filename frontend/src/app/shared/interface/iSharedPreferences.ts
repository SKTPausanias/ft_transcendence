import { UserInfoI } from "../ft_interfaces";
import { UserPublicInfoI } from "./iUserInfo";

export interface SharedPreferencesI {
	path: string,
	userInfo : UserInfoI;
	friends : UserPublicInfoI[];
	friend_invitation: UserPublicInfoI[];
	game_invitation:  UserPublicInfoI [];
	expandRightNav : boolean;
	in_game : boolean;
	chat: {
		active_room: any;
	 	rooms: any[];
	}
	unreaded_messages: number;
}