import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../user/user.entity";

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
    
    @Column('boolean', {default: false})
    ready_p1: boolean;

    @Column('boolean', {default: false})
    ready_p2: boolean;
}