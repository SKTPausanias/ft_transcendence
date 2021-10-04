import { type } from "os";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../shared/user/user.entity";

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
	
}

