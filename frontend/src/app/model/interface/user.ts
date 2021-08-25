import { UserRole } from "../enums/roles"
import { UserStatus } from "../enums/userStatus"

export interface UserI {
	id: 		number;
	first_name: 	string;
	last_name: 	string;
	nickname:	string;
	login: 		string;
	email:		string;
	status?:	UserStatus;
	role?:		UserRole;
	token?:		string; //uuid -> npm install uuid/v4
	token_expires:	number; 
	token_creation_time: number;
}