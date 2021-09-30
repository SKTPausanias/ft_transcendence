import { friend } from "src/shared/entity/friend.entity";

export interface UserI {
	id: 			number;
	uuid: 			string;
	first_name: 	string;
	last_name: 		string;
	nickname:		string;
	login: 			string;
	email:			string;
	status:			number;
	role:			string;
	avatar:			string;
	code2factor:	string;
	factor_enabled:	boolean;
	online:			boolean;
	victory:		number;
	defeat:			number;
	//friend:			friend;
}