import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany, JoinColumn } from "typeorm";
import { UserEntity } from "../../user/user.entity";
import { MessageEntity } from "./message.entity";
import { ChatUsersEntity } from "./chatUsers.entity";

@Entity('chat')
export class ChatEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ unique: true, nullable: true })
    name: string;

    @Column({nullable: true})
    type: string;

    @Column({nullable: true})
    password: string;

    @Column({default: false})
    protected: boolean;

    @ManyToMany(() => ChatUsersEntity)
	@JoinTable()
    members: ChatUsersEntity[];
}