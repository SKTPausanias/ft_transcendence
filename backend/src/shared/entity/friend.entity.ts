import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { users } from "./user.entity";

@Entity()
export class friend {
    @PrimaryGeneratedColumn()
    id: number;

    @Column() // Foreign key ,  user_id -> ManyToOne -> user
    user_id: number;

    @Column()
    friend_id: number;
}