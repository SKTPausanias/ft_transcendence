/* https://www.tutorialspoint.com/typeorm/typeorm_relations.htm - OneToOne relation */
import { PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, Entity, Timestamp} from 'typeorm'
import { users } from './user.entity';

@Entity()
export class code2factor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code: string;

    @Column()
    creation_time: number;

    @Column()
    expiration_time: number;

    @Column()
    validated: boolean; 

    @OneToOne(type => users, {onDelete:'CASCADE'}) @JoinColumn() 
    userID: users;

}