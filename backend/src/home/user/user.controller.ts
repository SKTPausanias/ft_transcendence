import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('api/users')
export class UserController {
	constructor(private userService: UserService){}
	@Get('/userInfo')
	async getUserInfo(@Headers() headers){
		return (await this.userService.getUserInfo(headers));
	}
	@Get('/online')
	async getOnlineUsers(@Headers() headers){
		return (await this.userService.getOnlineUsers(headers));
	}

	@Get('/friends')
	async getFriends(@Headers() headers){
		return (await this.userService.getFriends(headers));
	}
	@Post('/publicInfo')
	async getPublicInfo(@Body() body){
		//return (await this.userService.getFriends(headers));
		console.log("getPublicInfo() ", body);
		
		return (await this.userService.getUserPublicInfo(body.token, body.user));
	}
}
