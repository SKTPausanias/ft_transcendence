import { Controller, Get, Post, Body, Query} from '@nestjs/common';
import { AppService } from "../../app.service"

@Controller('api')
export class LoginController {
	constructor(private appService: AppService){}
	@Get('/login')
	async getLogin(@Query() query){
		console.log("llega aqui?");
		const resp =  await this.appService.getLoginInfo(query.code);
		//42 api data
		// Deberia devolver nuestro modelo
		// 1. user info
		// 2. status

		return (resp);
	}
}
