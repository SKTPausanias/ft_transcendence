import { SessionEntity } from "src/session/session.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ActiveRoomEntity } from "../chat/entities/activeRoom.entity";
import { ChatEntity } from "../chat/entities/chat.entity";
import { ChatUsersEntity } from "../chat/entities/chatUsers.entity";
import { MessageEntity } from "../chat/entities/message.entity";
import { StatsEntity } from "../play/stats.entity";
import { FriendEntity } from "../friends/friend.entity";
import { PlayEntity } from "../play/play.entity";

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
	@Column({nullable: false, default : false})
    in_game: boolean;

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

	


    @OneToMany(() => ChatEntity, (room) => room.id)
    rooms: ChatUsersEntity[];

    @OneToMany(type => MessageEntity, message => message.owner)
    messages: MessageEntity[];

   /*  // relation with user1 and user2 from statsEntity
    @OneToMany(type => StatsEntity, stats => stats.user1)
    stats: StatsEntity[];

    @OneToMany(type => StatsEntity, stats => stats.user2)
    stats2: StatsEntity[]; */

    @Column({nullable: false, default: 0})
    victories: number;

    @Column({nullable: false, default: 0})
    defeats: number;

    /* @Column("int", {array: true , default: []})
	  active_chat_rooms: number[]; */
    //Relation with activeRooms: one user can have many activeRooms
    @OneToMany(() => ActiveRoomEntity, (activeRoom) => activeRoom.id)
    activeRooms: ActiveRoomEntity[];

    @ManyToOne(() => PlayEntity,
	{onDelete: "SET NULL"})
    @JoinColumn()
    live: PlayEntity;
}

