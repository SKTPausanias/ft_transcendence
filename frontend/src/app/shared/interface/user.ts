import * as enums from "../enums/eUser"

export interface UserI {
	id: 		number;
	first_name: string;
	last_name: 	string;
	nickname:	string;
	login: 		string;
	email:		string;
	status?:	enums.UserStatus;
	role?:		enums.UserRole;
}