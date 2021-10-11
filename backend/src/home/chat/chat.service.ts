import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionService } from 'src/session/session.service';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { FriendEntity } from './chat.entity'

@Injectable()
export class ChatService {
    constructor(
		@InjectRepository(FriendEntity) private friendRepository: Repository<FriendEntity>,
        private sessionService: SessionService,
        private userService: UserService
        ){}
	async searchUser(match: string, header: any)
	{
		try {
            const token = header.authorization.split(' ')[1];
            const session = await this.sessionService.findSessionWithRelation(token);
            return (await this.userService.findMatchByLoginNickname(match, session.userID));
        } catch (error) {
                return (error);
        }
	}
	async addFriend(user, header): Promise<any> {
		try {
			const token = header.authorization.split(' ')[1];
            const session = await this.sessionService.findSessionWithRelation(token);
			console.log("Sesion has: ", session);

			const friend = await this.userService.findByNickname(user.nickname);

			const test1 = await this.friendRepository.find({where: [ //where user.id && friend.id
					{ user_1 : session.userID.id },
					{ user_2 : friend.id }
				]
			});

			const test2 = await this.friendRepository.find({where: [ //where user.id && friend.id
					{ user_2 : session.userID.id },
					{ user_1 : friend.id }
				]
			});

			console.log("Test1: ", test1);
			console.log("Test2: ", test2);
			if (!test1.length && !test2.length)
				return (await this.friendRepository.save({ user_1: session.userID, user_2: friend }));
		}catch (e) {
			return (e);
		}
	}
}
