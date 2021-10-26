import { UserInfoI } from "../ft_interfaces";
import { UserPublicInfoI } from "./iUserInfo";

export interface SharedPreferencesI {
	userInfo : UserInfoI;
	friends : UserPublicInfoI[];
	friend_invitation: UserPublicInfoI[];
	expandRightNav : boolean;
	chat_messages : string[];
}