import { Column, Entity, PrimaryColumn, OneToMany } from "typeorm";
import { friend } from "./friend.entity";

@Entity()
export class users {

    @PrimaryColumn()
    id: number;
    
    @Column({unique: true})
    uuid: string;

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

    @Column()
    avatar: string;

    @Column()
    code2factor: string;

    @Column()
    factor_enabled: boolean;

    @Column()
    online: boolean;

    @Column()
    victory: number;
    
    @Column()
    defeat: number;
    //@OneToMany(() => friend, friend => friend.user)
    //friends: friend;
}

