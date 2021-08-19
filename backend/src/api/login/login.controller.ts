import { Controller, Get, Query} from '@nestjs/common';
import { AppService } from "../../app.service"

@Controller('api/login')
export class LoginController {
	constructor(private appService: AppService){}
	@Get()
	async getLogin(@Query() query){
		const resp =  await this.appService.getLoginInfo(query.code);
		return (resp); 
	}
}
