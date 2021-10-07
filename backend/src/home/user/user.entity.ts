import { SessionEntity } from "src/session/session.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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

    @OneToMany(type => SessionEntity, session => session.token,
		{
			onDelete: "SET NULL"
		})
    sessions: SessionEntity[];

}

