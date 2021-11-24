import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { UserEntity } from "../../user/user.entity";
import { ChatEntity } from "./chat.entity";

@Entity('chat_users')
export class ChatUsersEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => UserEntity, user => user.rooms)
    user: UserEntity;

    @Column({default : false})
    owner: boolean;

    @Column({default : false})
    muted: boolean;

    @Column({default : false})
    banned: boolean;

}