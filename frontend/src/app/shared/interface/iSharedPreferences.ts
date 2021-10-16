import { UserInfoI } from "../ft_interfaces";
import { UserPublicInfoI } from "./iUserInfo";

export interface SharedPreferencesI {
	userInfo : UserInfoI;
	friends : UserPublicInfoI[];
	expandRightNav : boolean;
}