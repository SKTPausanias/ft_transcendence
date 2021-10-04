import { type } from "os";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../../shared/user/user.entity";

@Entity('confirmation')
export class ConfirmationEntity {

    @PrimaryGeneratedColumn('increment')
    id: number;
    
    @Column({nullable: false})
    confirmation_nb: string;

	@Column({nullable: false})
    expiration_time: number;
	
    @OneToOne(type => UserEntity, {onDelete:'CASCADE'})
	@JoinColumn()
    userID: UserEntity;
	
}

