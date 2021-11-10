import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { MessageEntity } from "../chat/message.entity";
import { ChatUsersEntity } from "./chatUsers.entity";

@Entity('chat')
export class ChatEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ unique: true })
    name_chat: string;

    @Column()
    type_chat: string;

    @Column()
    password: string;

    @OneToMany(() => ChatUsersEntity, (chatUser) => chatUser.chat)
    chats: ChatUsersEntity[];

    @OneToMany(type => MessageEntity, message => message.chat)
    messages: MessageEntity[];
}