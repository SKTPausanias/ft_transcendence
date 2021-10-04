import { Controller, Get, Post, Body, Query} from '@nestjs/common';
import { UserService } from '../../user.service';
import { UserStatus } from 'src/modules/user/model/user/eUser'
import { utimesSync } from 'fs';

@Controller('/api')
export class LoginController {
	constructor(private userService: UserService){}
	@Get('/login')
	async getLogin(@Query() query){
		const resp =  await this.userService.authorization(query.code);
		if (resp.status === UserStatus.CONFIRMED && resp.factor_enabled === false)
		{
			resp.online = true;
			await this.userService.updateUser(resp);
		}
		console.log("login");
		//42 api data
		// Deberia devolver nuestro modelo
		// 1. user info
		// 2. status

		return (resp);
	}
	@Get('/logout')
	async logout(@Query() query)
	{
		const usr = await this.userService.findById(query.id);
		if (usr !== undefined && usr.online)
		{
			usr.online = false;
			await this.userService.updateUser(usr);
		}
	}
}
