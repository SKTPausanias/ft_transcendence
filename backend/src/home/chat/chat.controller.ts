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
        return (await this.chatService.saveChatGroup(body, headers.authorization));
    }

    @Get('/getChatGroups')
    async getChatGroups(@Headers() headers): Promise<any>{
        console.log("hoaa", headers.authorization);
        return (await this.chatService.getChatGroups(headers.authorization));
    }

    @Post('/addChannel')
    async addChannel(@Body() body, @Headers() headers): Promise<any> {
        console.log("Body: ", body);
        return (await this.chatService.saveChatGroup(body, headers.authorization));
    }
}