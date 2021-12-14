import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { UserEntity } from "../../user/user.entity";

@Entity('stats')
export class StatsEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    user1_points: number;

    @Column()
    user2_points: number;

	@ManyToOne(type => UserEntity, user => user.stats)
    user1: UserEntity;

	@ManyToOne(type => UserEntity, user => user.stats2)
    user2: UserEntity;
}