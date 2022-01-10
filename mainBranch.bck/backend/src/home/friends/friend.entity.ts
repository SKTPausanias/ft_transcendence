import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../user/user.entity";

@Entity('friends')
export class FriendEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => UserEntity, {onDelete:'CASCADE'})
	@JoinColumn()
    user_1: UserEntity;

    @ManyToOne(type => UserEntity, {onDelete:'CASCADE'})
	@JoinColumn()
    user_2: UserEntity;

    @Column('boolean', {default: false})
    confirmed: boolean;
}