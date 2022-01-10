import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { UserEntity } from "../home/user/user.entity";

@Entity('session')
export class SessionEntity {

    @PrimaryColumn({nullable: false})
    token: string; 

	@Column({nullable: false})
    expiration_time: number;
	
    @ManyToOne(type => UserEntity, userID => userID.sessions,
		{
			onDelete: "CASCADE"
		})
	@JoinColumn({ name: 'user_id' })
    userID: UserEntity;
	
	@Column({nullable: true})
	socket_id: string;
	
}

