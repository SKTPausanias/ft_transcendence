import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../../shared/user/user.entity";

@Entity('two_factor')
export class TwoFactorEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;
    
    @Column({nullable: false})
    otpauth_url: string;

    @Column({nullable: false})
    base: string;

	@Column({nullable: false})
    expiration_time: number;
	
    @OneToOne(type => UserEntity, {onDelete:'CASCADE'})
	@JoinColumn()
    userID: UserEntity;
	
}

