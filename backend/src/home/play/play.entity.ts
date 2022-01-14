import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { eRequestPlayer } from "./ePlay";

@Entity('play')
export class PlayEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => UserEntity, {onDelete:'CASCADE'})
	@JoinColumn()
    player_1: UserEntity;

    @ManyToOne(type => UserEntity, {onDelete:'CASCADE'})
	@JoinColumn()
    player_2: UserEntity;

    @Column('boolean', {default: false})
    confirmed: boolean;

	@Column({nullable: true})
    expiration_time: number;
    
    @Column({default: eRequestPlayer.WAITING})
    p1_status: string;

    @Column({default: eRequestPlayer.WAITING})
    p2_status: string;
}