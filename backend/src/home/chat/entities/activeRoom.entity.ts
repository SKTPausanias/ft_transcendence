import { UserEntity } from "src/home/user/user.entity";
import { Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ChatEntity } from "./chat.entity";

@Entity('active_room')
export class ActiveRoomEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => UserEntity, user => user.id)
    user: UserEntity;

    @ManyToOne(type => ChatEntity, chat => chat.id,
		{
			onDelete: "CASCADE"
		})
    chat: ChatEntity;

}