import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { UserEntity } from "../../user/user.entity";
import { UserPublicInfoI } from "../../user/userI";
import { ChatEntity } from "./chat.entity";

@Entity('message')
export class MessageEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({nullable: false})
    message: string;

	@Column({nullable: false})
	date: string;

	@ManyToOne(type => UserEntity, user => user.messages)
    user: UserEntity;

    @ManyToOne(type => ChatEntity)
    chat: ChatEntity;

}
