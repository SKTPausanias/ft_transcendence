import { SessionEntity } from "src/session/session.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToMany } from "typeorm";
import { FriendEntity } from "../friends/friend.entity";
import { ChatEntity } from "../chat/chat.entity";
import { MessageEntity } from "../chat/message.entity";
import { ChatUsersEntity } from "../chat/chatUsers.entity";
@Entity('users')
export class UserEntity {

    @PrimaryGeneratedColumn('increment')
    id: number;
    
    @Column({nullable: true, unique: true })
    ft_id: number;
	
    @Column({nullable: false})
    first_name: string;
    
    @Column({nullable: false})
    last_name: string;
	
    @Column({nullable: false, unique: true})
    email: string;

    @Column({nullable: false, unique: true})
    login: string;

    @Column({nullable: false, unique: true})
    nickname: string;

	  @Column({nullable: true})
    password: string;

    @Column({nullable: false})
    role: string;

    @Column({nullable: false})
    avatar: string;

    @Column({nullable: false})
    factor_enabled: boolean;

    @Column({nullable: false})
    confirmed: boolean;
	
	@Column({nullable: false, default : false})
    online: boolean;

    @OneToMany(type => SessionEntity, session => session.token,
		{
			onDelete: "SET NULL"
		})
    sessions: SessionEntity[];

    @OneToMany(type => FriendEntity, friend => friend.id,
    {
      onDelete: "SET NULL"
    })
    friends: FriendEntity[];

    @OneToMany(() => ChatEntity, (chat) => chat.chats)
    chats: ChatUsersEntity[];

    @OneToMany(type => MessageEntity, message => message.user)
    messages: MessageEntity[];
}

