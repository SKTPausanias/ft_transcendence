import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { ChatEntity } from "../chat/chat.entity";

@Entity('message')
export class MessageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => UserEntity, user => user.messages)
    user: UserEntity;

    @ManyToOne(type => ChatEntity, chat => chat.messages)
    chat: ChatEntity;

    @Column()
    message: string;
}