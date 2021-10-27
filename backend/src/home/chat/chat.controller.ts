import { Controller, Post, Body, Headers } from "@nestjs/common";
import { ChatService } from "./chat.service";

@Controller('/api/users/chat')
export class ChatController {
    constructor(private chatService: ChatService){}
    @Post('/saveMessage')
    async saveMessage(@Body() body, @Headers() headers): Promise<any>{
        //console.log("Body is: ", body);
        //console.log("Header is: ", headers);
        return (await this.chatService.saveMessage(body, headers.authorization));
    }
}