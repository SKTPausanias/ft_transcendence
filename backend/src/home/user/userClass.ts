//import conf from '../../../ft_config.json';

import e from "express";
import { SessionEntity } from "src/session/session.entity";
import { UserEntity } from "./user.entity";
import { UserI, UserInfoI, UserPublicInfoI, UserRegI } from "./userI";
import { IsNumber, Matches, IsEmail, IsBoolean, MaxLength, MinLength, IsString, isAlphanumeric } from 'class-validator'
import { FriendEntity } from "../friends/friend.entity";


export class User implements UserI {

	ft_id:			number;

	@Matches(/^[\u0020\u0030-\u0039\u0041-\u005A\u0061-\u007A\u00E1\u00E9\u00ED\u00F3\u00FA\u00C1\u00C9\u00CD\u00D3\u00DA\u00DC\u00FC\u00C4\u00CB\u00D6\u00CF\u00E4\u00EB\u00EF\u00F6\u00D1\u00F1]+$/, {message: 'Invalid characters'})
	first_name: 	string;

	@Matches(/^[\u0020\u0030-\u0039\u0041-\u005A\u0061-\u007A\u00E1\u00E9\u00ED\u00F3\u00FA\u00C1\u00C9\u00CD\u00D3\u00DA\u00DC\u00FC\u00C4\u00CB\u00D6\u00CF\u00E4\u00EB\u00EF\u00F6\u00D1\u00F1]+$/, {message: 'Invalid characters'})
	last_name: 		string;

	@MaxLength(12)
	@MinLength(3)
	login:			string;

	@Matches(/^[\u0020\u0030-\u0039\u0041-\u005A\u0061-\u007A\u00E1\u00E9\u00ED\u00F3\u00FA\u00C1\u00C9\u00CD\u00D3\u00DA\u00DC\u00FC\u00C4\u00CB\u00D6\u00CF\u00E4\u00EB\u00EF\u00F6\u00D1\u00F1]+$/, {message: 'Invalid characters'})
	@MaxLength(12, { message: 'nickname too long: max 12 characters' })
	@MinLength(3, { message: 'nickname too short: min 5 characters' })
	nickname:		string;

	password:		string;

	@IsEmail()
	email:			string;

	status:			number;

	role:			string;

	avatar:			string;

	@IsBoolean()
	factor_enabled:	boolean;

	confirmed:		boolean;

	sesionID: 		SessionEntity;

	friends:		FriendEntity[];

	constructor (){};

	static getUser(data: any): UserI
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
		if (data.confirmed !== undefined)
			user.confirmed = data.confirmed;
		else
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
		user.factor_enabled = false;
		user.confirmed = true;
		return (user);
	}
	static getInfo(data: any): UserInfoI{
	//	var aux: FriendEntity[] = [];
		return ({
			login: data.login,
			nickname : data.nickname,
			first_name : data.first_name,
			last_name : data.last_name,
			email : data.email,
			avatar : data.avatar,
			factor_enabled : data.factor_enabled,
			online: data.online,
			in_game: data.in_game,
			hits: data.hits,
			victories: data.victories,
			defeats: data.defeats
	//		friends: aux
		});
	}
	static getPublicInfo(data: any): UserPublicInfoI{
		return ({
			login: data.login,
			nickname : data.nickname,
			first_name : data.first_name,
			last_name : data.last_name,
			avatar : data.avatar,
			online: data.online,
			in_game: data.in_game,
			hits: data.hits,
			victories: data.victories,
			defeats: data.defeats
			});
	}
	static getMultipleUserInfo(users: UserEntity[], user: UserEntity): UserPublicInfoI[]{
        var ret: UserPublicInfoI[] = [];
        users.forEach(element => {
            if (element.id != user.id)
                ret.push(this.getPublicInfo(element));
        });
        return (ret);
    }
	static getOnlineUserInfo(data: SessionEntity[]){
		var users: UserPublicInfoI[] = [];
		data.forEach(element => {
			if (users.find(user => user.nickname === element.userID.nickname) === undefined)
				users.push(this.getPublicInfo(element.userID));
		});
		return (users);
	}
	
}