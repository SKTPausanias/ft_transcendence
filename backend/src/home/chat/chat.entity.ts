import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "../user/user.entity";

@Entity('friends')
export class FriendEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(type => UserEntity, {onDelete:'CASCADE'})
	@JoinColumn()
    user_1: UserEntity;

    @OneToOne(type => UserEntity, {onDelete:'CASCADE'})
	@JoinColumn()
    user_2: UserEntity;

    @Column('boolean', {default: false})
    confirnmed: boolean;
}