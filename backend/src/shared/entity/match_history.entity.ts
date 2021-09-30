import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class match_history {
    @PrimaryGeneratedColumn()
    match_id: number;

    @Column({unique: true})
    nickname1: string;

    @Column({unique: true})
    nickname2: string;

    @Column()
    score1: number;

    @Column()
    score2: number;
}