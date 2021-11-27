import { Controller, Post, Body, Headers, Get } from "@nestjs/common";
import { ChatService } from "./chat.service";

@Controller('/api/users/chat')
export class ChatController {
    constructor(private chatService: ChatService){}

	@Post('/addChannel')
	async addChannel(@Body() body, @Headers() headers): Promise<any> {
		return (await this.chatService.addChanel(body, headers.authorization));
	}
	@Post('/unlockRoom')
	async unlockRoom(@Body() body, @Headers() headers): Promise<any> {
		return (await this.chatService.unlockRoom(body, headers.authorization));
	}
}
