import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { ChatEntity } from "./chat.entity";
import { MessageEntity } from "./message.entity";
import { Response } from 'src/shared/response/responseClass';
import { UserService } from "../user/user.service";
import { messageI } from "./chatI";

import { SessionService } from "src/session/session.service";
import { DashboardService } from "../dashboard/dashboard.service";

@Injectable()
export class ChatService {
	private myChat = new ChatEntity();
	constructor(
		@InjectRepository(ChatEntity) private chatRepository: Repository<ChatEntity>,
		@InjectRepository(MessageEntity) private messageRepository: Repository<MessageEntity>,
		private sessionService: SessionService,
		@Inject(forwardRef(() => UserService))
		private userService: UserService,
        ){}

	async saveChat(type_chat : string, users : UserEntity[], name_chat? : string): Promise<any> {
		try {
			this.myChat.name_chat = name_chat ? name_chat : users[0].id + '_' + users[1].id;
			this.myChat.type_chat = type_chat;
			this.myChat.users = users;
			this.myChat.password = '123';
			await this.chatRepository.save(this.myChat); // what kind of response do we need??
			return (Response.makeResponse(200, { ok: "Chat was saved" }));
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, {error : 'unable to save chat'}));
		}
		
		
	}
	async saveMessage(body: any, header: string): Promise<any> {
		const token = header.split(' ')[1];
		var eMsg = new MessageEntity();
		try {

			const session = await this.sessionService.findSessionWithRelation(token);
			const friend = await this.userService.findByNickname(body.receiver);
			eMsg.message = body.message;
			eMsg.user = session.userID;
			var name_chat = session.userID.id + '_' + friend.id;
			var name_chat2 = friend.id + '_' + session.userID.id;

			const chat = await this.chatRepository.findOne({
				where: [{ name_chat: name_chat }, { name_chat: name_chat2 }] }); // this is an OR
			eMsg.chat = chat;
			const ret = await this.messageRepository.save(eMsg);
			return(Response.makeResponse(200, {ok: "hola desde el backend"}));
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, {error : 'unable to save message'}));
		}
	}
}