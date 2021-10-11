import { Body, Controller, Post, Query } from '@nestjs/common';
import { Get, Headers } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('api/users/chat')
export class ChatController {
    constructor(private chatService: ChatService){}
	@Get('/search')
	async search(@Query() query, @Headers() headers){
		if (query.match !== undefined)
			return await this.chatService.searchUser(query.match, headers);
	}
	@Post('/addFriend')
	async addFriend(@Body() user: any, @Headers() headers) {
		return (await this.chatService.addFriend(user, headers));
	}
}
