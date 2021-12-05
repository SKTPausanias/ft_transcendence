import { Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatUsersEntity } from "./chatUsers.entity";
import { MessageEntity } from "./message.entity";
@

Entity('unread_messages')
export class UnreadMessageEntity {
    
    @PrimaryGeneratedColumn()
    id: number;
	
    @ManyToOne(type => MessageEntity, message => message.id,
		{
			onDelete: "CASCADE"
		})
    message: MessageEntity;

	@ManyToOne(type => ChatUsersEntity, chatUser => chatUser.id,
	{
		onDelete: "CASCADE"
	})
    chatUser: ChatUsersEntity;
}