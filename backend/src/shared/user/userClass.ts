//import conf from '../../../ft_config.json';

import e from "express";
import { SessionEntity } from "src/session/session.entity";
import { UserEntity } from "./user.entity";
import { UserI, UserInfoI, UserRegI } from "./userI";


export class User implements UserI {

	ft_id:			number;
	first_name: 	string;
	last_name: 		string;
	login:			string;
	nickname:		string;
	password:		string;
	email:			string;
	status:			number;
	role:			string;
	avatar:			string;
	factor_enabled:	boolean;	
	confirmed:		boolean;
	sesionID: 		SessionEntity;

	constructor (){};

	static getUser(data: UserRegI): UserI
	{
		let user: UserI = <UserI>{};
		user.first_name = data.first_name;
		user.last_name = data.last_name;
		user.login = data.login;
		user.nickname = data.nickname;
		user.password = data.password;
		user.email = data.email;
		user.avatar = process.env.AVATAR;
		user.role = process.env.ROLE_USER;
		user.factor_enabled = data.factor_enabled;
		user.confirmed = false
		return (user);
	}
	static getFtUser(data: any): UserI
	{
		let user: UserI = <UserI>{};
		var obj = process.env.CONTRIBUTORS.split(' ');

		user.ft_id = data.id;
		user.first_name = data.first_name;
		user.last_name = data.last_name;
		user.nickname = data.login;
		user.login = data.login;
		user.email = data.email;
		user.avatar = data.image_url;
		user.role = process.env.ROLE_USER;
		obj.forEach(element => {
			if (element == user.nickname)
				user.role = process.env.ROLE_ADMIN;
		});
		user.factor_enabled = true;
		user.confirmed = true;
		return (user);
	}
	static getInfo(data: any): UserInfoI{
		return ({
			login: data.login,
			nickname : data.nickname,
			first_name : data.first_name,
			last_name : data.last_name,
			email : data.email,
			avatar : data.avatar,
			});
	}
	static getOnlineUserInfo(data: SessionEntity[]){
		var users: UserInfoI[] = [];
		data.forEach(element => {
			if (users.find(user => user.nickname === element.userID.nickname) === undefined)
				users.push(this.getInfo(element.userID));
		});
		return (users);
	}
	
}