import { UserRole } from "../enums/roles"

export interface UserI {
	id: 		number;
	firstName: 	string;
	lastName: 	string;
	username:	string;
	email:		string;
	role?:		UserRole;
	token?:		string;
	//token: 		string 20
	//toke_expires	number
	//token_creation_time number	
}