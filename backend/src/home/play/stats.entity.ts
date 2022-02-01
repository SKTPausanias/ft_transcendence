import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { UserEntity } from "../user/user.entity";

@Entity('stats')
export class StatsEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    hits_p1: number;

    @Column()
    hits_p2: number;

    @Column()
    score_p1: number;

    @Column()
    score_p2: number;

    @Column()
    player_1: string; //login

    @Column()
    player_2: string; //login
}