import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { ChatEntity } from "../chat/chat.entity";

@Entity('chat_users')
export class ChatUsersEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => UserEntity, user => user.chats)
    user: UserEntity;

    @ManyToOne(type => ChatEntity, chat => chat.chats)
    chat: ChatEntity;

    @Column()
    owner: boolean;

}