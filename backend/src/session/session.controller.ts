import { Controller, Get, Headers } from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('api/session')
export class SessionController {
	constructor(private sessionService: SessionService){}
	
	@Get('/userInfo')
	async getUserInfo(@Headers() headers){
		return (await this.sessionService.getUserInfo(headers));
	}
	@Get('/online/Users')
	async getOnlineUsers(@Headers() headers){
		return (await this.sessionService.getOnlineUsers(headers));
	}
}
