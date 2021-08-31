import { Controller, Get, Post, Body, Query} from '@nestjs/common';
import { UserService } from '../../user.service';

@Controller('/api')
export class LoginController {
	constructor(private userService: UserService){}
	@Get('/login')
	async getLogin(@Query() query){
		const resp =  await this.userService.authorization(query.code);
		//42 api data
		// Deberia devolver nuestro modelo
		// 1. user info
		// 2. status

		return (resp);
	}
}