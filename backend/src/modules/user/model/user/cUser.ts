import { UserI } from "./iUser";

export class User implements UserI {

	id: 			number;
	uuid:			string;
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

	constructor (){};

	setUser(data: any)
	{
		this.id = data.id;
		this.uuid = data.uuid;
		this.first_name = data.first_name;
		this.last_name = data.last_name;
		this.nickname = data.login;
		this.login = data.login;
		this.email = data.email;
		this.avatar = data.image_url;
		this.code2factor = '';
		this.factor_enabled = false;
		this.online = false;
	}
}