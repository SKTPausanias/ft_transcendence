import { Controller, Post, Body, Headers, Get } from "@nestjs/common";
import { ChatService } from "./chat.service";

@Controller('/api/users/chat')
export class ChatController {
    constructor(private chatService: ChatService){}
    @Post('/saveMessage')
    async saveMessage(@Body() body, @Headers() headers): Promise<any>{
        return (await this.chatService.saveMessage(body, headers.authorization));
    }

    @Post('/getMessages')
    async getMessages(@Body() body, @Headers() headers): Promise<any>{
        return (await this.chatService.getMessages(body, headers.authorization));
    }

    @Post('/saveChatGroup')
    async saveChat(@Body() body, @Headers() headers): Promise<any>{
        console.log("body", body);
        return (await this.chatService.saveChatGroup(body, headers.authorization));
    }
}