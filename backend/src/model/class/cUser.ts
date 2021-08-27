import { UserRole, UserStatus } from "../enums/eUser";
import { UserI } from "../interface/iUser";

export class User implements UserI {

	id: 			number;
	first_name: 	string;
	last_name: 		string;
	nickname:		string;
	login: 			string;
	email:			string;
	status:			number;
	role:			string;

	constructor (){};

	setUser(data: any)
	{
		this.id = data.id;
		this.first_name = data.first_name;
		this.last_name = data.last_name;
		this.nickname = data.login;
		this.login = data.login;
		this.email = data.email;
	}
}