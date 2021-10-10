import { Body, Controller, Post, Param, Query } from '@nestjs/common';
import { Get, Headers } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { UserService } from '../user/user.service';
import { query } from 'express';

@Controller('api/users/chat')
export class ChatController {
    constructor(private chatService: ChatService){}
	@Get('/search')
	async search(@Query() query, @Headers() headers){
		if (query.match !== undefined)
			return await this.chatService.searchUser(query.match, headers);
	}
}
