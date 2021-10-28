import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { ChatEntity } from "./chat.entity";
import { MessageEntity } from "./message.entity";
import { Response } from 'src/shared/response/responseClass';
import { UserService } from "../user/user.service";
import { SessionService } from "src/session/session.service";

@Injectable()
export class ChatService {
	private myChat = new ChatEntity();
	constructor(
		@InjectRepository(ChatEntity) private chatRepository: Repository<ChatEntity>,
		@InjectRepository(MessageEntity) private messageRepository: Repository<MessageEntity>,
		private sessionService: SessionService,
		//A circular dependency occurs when two classes depend on each other. For example, class A needs class B, and class B also needs class A. 
		@Inject(forwardRef(() => UserService)) // forwardRef solves circular dependencies: 
		private userService: UserService,
        ){}

		//This function saves oneToOne chats when friendship is accepted from both users. Look at friend.service
	async saveChat(type_chat : string, users : UserEntity[], name_chat? : string): Promise<any> {
		try {
			this.myChat.name_chat = name_chat ? name_chat : users[0].id + '_' + users[1].id;
			this.myChat.type_chat = type_chat;
			this.myChat.users = users;
			this.myChat.password = '123'; // this must be created in the frontend
			await this.chatRepository.save(this.myChat); // what kind of response do we need??
			return (Response.makeResponse(200, { ok: "Chat oneOnOne was saved" }));
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, {error : 'unable to save chat'}));
		}
	}

	/*
	* When a message comes from the frontend chat, we need to check if emiter and receiver has a chat oneToOne created
	* if is correct, we save the message, chatID which both user belong and the id of the user propietary
	*/
	async saveMessage(body: any, header: string): Promise<any> {
		const token = header.split(' ')[1];
		var eMsg = new MessageEntity();
		try {

			const session = await this.sessionService.findSessionWithRelation(token);
			const friend = await this.userService.findByNickname(body.receiver);
			eMsg.message = body.message;
			eMsg.user = session.userID;
			eMsg.date = body.timestamp;
			var name_chat = session.userID.id + '_' + friend.id;
			var name_chat2 = friend.id + '_' + session.userID.id;

			const chat = await this.chatRepository.findOne({
				where: [{ name_chat: name_chat }, { name_chat: name_chat2 }] }); // this is an OR
			eMsg.chat = chat;
			const ret = await this.messageRepository.save(eMsg);
			return(Response.makeResponse(200, {ok: "Message has been saved"}));
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, {error : 'Unable to save message'}));
		}
	}
}