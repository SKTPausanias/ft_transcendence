import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class users {

    @PrimaryColumn()
    id: number;

    @Column({unique: true})
    email: string;

    @Column({unique: true})
    login: string;

    @Column({unique: true})
    nickname: string;

    @Column()
    first_name: string;
    
    @Column()
    last_name: string;

    @Column()
    status: number;

    @Column()
    role: string;
}
