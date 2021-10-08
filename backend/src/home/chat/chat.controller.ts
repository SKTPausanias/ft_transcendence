import { Body, Controller, Post, Param, Query } from '@nestjs/common';
import { Get, Headers } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { UserService } from '../user/user.service';

@Controller('api/users/chat')
export class ChatController {
    constructor(private chatService: ChatService,
		private userService: UserService){}
	@Post('/findPeople')
	async findPeople(@Body() body, @Headers() headers){
		//console.log("params", params);
		console.log("body:", body.text);
		console.log("headers", await headers);
		return await this.userService.findMatchingPeople(body.text, headers);
	}
}
