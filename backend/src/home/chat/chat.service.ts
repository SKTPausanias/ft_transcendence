import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Connection, Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { ChatEntity } from "./chat.entity";

@Injectable()
export class ChatService {
	private myChat = new ChatEntity();
	constructor(
		@InjectRepository(ChatEntity) private chatRepository: Repository<ChatEntity>,
       	//private sessionService: SessionService,
        //private userService: UserService
        ){}

	async saveChat(type_chat : string, users : UserEntity[], name_chat? : string): Promise<ChatEntity> {
		this.myChat.name_chat = name_chat ? name_chat : users[0].id + '_' + users[1].id;
		this.myChat.type_chat = type_chat;
		this.myChat.users = users;
		this.myChat.password = '123';
		return await this.chatRepository.save(this.myChat);
	}
}