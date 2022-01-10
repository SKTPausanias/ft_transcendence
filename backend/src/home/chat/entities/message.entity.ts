import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { UserEntity } from "../../user/user.entity";
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
    owner: UserEntity;

    @ManyToOne(type => ChatEntity, room => room.id,
		{
			onDelete: "CASCADE"
		})
    chat: ChatEntity;

	

}
