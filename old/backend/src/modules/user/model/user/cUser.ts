import { UserI } from "./iUser";
import { IsAlpha, IsNumber, Matches, IsEmail, IsBoolean, MaxLength, MinLength, IsString } from 'class-validator'

export class User implements UserI {

	@IsNumber()
	id: 			number;

	uuid:			string;

	@Matches(/^([a-zA-Z]+([ ]?[a-zA-Z]?['-]?[a-zA-Z]+)*)$/)
	first_name: 	string;

	@Matches(/^([a-zA-Z]+([ ]?[a-zA-Z]?['-]?[a-zA-Z]+)*)$/)
	last_name: 		string;

	@Matches(/^[a-zA-Z0-9\-\_]{5,12}$/, { message: 'Invalid nickname' })
	@MaxLength(12, { message: 'nickname too long: max 12 characters' })
	@MinLength(5, { message: 'nickname too short: min 5 characters' })
	nickname:		string;

	@MaxLength(12)
	@MinLength(6)
	login: 			string;
	
	@IsEmail()
	email:			string;

	@IsNumber()
	status:			number;

	role:			string;
	avatar:			string;
	code2factor:	string;

	@IsBoolean()
	factor_enabled:	boolean;

	@IsBoolean()
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