import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, JoinColumn, ManyToOne } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { MessageEntity } from "./message.entity";

@Entity('chat')
export class ChatEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

	@Column({nullable: true, unique: true})
	name: string;
	
	@ManyToMany(type => UserEntity, user => user.id)
	@JoinTable()
	members: UserEntity[];

	@ManyToMany(type => UserEntity, user => user.id)
	@JoinTable()
	blocked_members: UserEntity[];
}
/*
@Entity('chat_user')
export class ChatUserEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

	@Column({nullable: true, unique: true})
	name: string;
	
	@ManyToOne(type => UserEntity)
    owner: UserEntity;

	@ManyToOne(type => ChatEntity, chat => chat.id,
		{
			onDelete: "CASCADE"
		})
    chat: ChatEntity;



	@Column({nullable: true, unique: true})
	name: string;

	
}
*/
