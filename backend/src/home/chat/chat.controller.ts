import { Controller, Post, Headers } from "@nestjs/common";
import { ChatService } from "./chat.service";

@Controller('/api/users/chat')
export class ChatController {
    constructor(private chatService: ChatService){}
    @Post('/saveMessage')
    async saveMessage(@Headers() headers): Promise<any>{
        console.log(headers);
        await this.chatService.saveMessage();
    }
}