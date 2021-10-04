import * as enums from "../enums/eUser"

export interface UserI {
	id:		 		number;
	uuid:			string;
	first_name:		string;
	last_name:	 	string;
	nickname:		string;
	login:	 		string;
	email:			string;
	status?:		enums.UserStatus;
	role?:			enums.UserRole;
	avatar:			string;
	code2factor:	string;
	factor_enabled:	boolean;
	online:			boolean;
	victory:		number;
	defeat:			number;
}