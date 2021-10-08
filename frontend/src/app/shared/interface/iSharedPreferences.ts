import { UserInfoI } from "../ft_interfaces";

export interface SharedPreferencesI {
	userInfo : UserInfoI;
	allUsers : UserInfoI[];
	expandRightNav : boolean;
}