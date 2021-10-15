import { Controller, Get, Headers } from '@nestjs/common';
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
}
