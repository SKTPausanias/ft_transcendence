import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionService } from 'src/session/session.service';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { FriendEntity } from '../friends/friend.entity'
import { FriendService } from '../friends/friend.service';
import { Exception } from 'src/shared/utils/exception';
import { Response } from 'src/shared/response/responseClass';

@Injectable()
export class ChatService {
    constructor(
		private friensService: FriendService,
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
	async addFriend(user, header){
		try {
			const token = header.authorization.split(' ')[1];
			const session = await this.sessionService.findSessionWithRelation(token);	
			const friend = await this.userService.findByNickname(user.nickname);
			return await this.friensService.addFriend(session.userID, friend);
		} catch (error) {
			return (error);
		}
	}
	

    async removeFriend(user, header): Promise<any> {
		try {
			const token = header.authorization.split(' ')[1];
			const session = await this.sessionService.findSessionWithRelation(token);	
			const friend = await this.userService.findByNickname(user.nickname);
			return await this.friensService.removeFriend(session.userID, friend);
		} catch (error) {
			return (error);
		}
      /*   try {
            const token = header.authorization.split(' ')[1];
            const session = await this.sessionService.findSessionWithRelation(token);
            const friend = await this.userService.findByNickname(user.nickname);

			const test1 = await this.friendRepository.findOne({where: [ //where user.id && friend.id
                    { user_1 : session.userID.id },
                    { user_2 : friend.id }
                ]
            });
            const test2 = await this.friendRepository.findOne({where: [ //where user.id && friend.id
                    { user_2 : session.userID.id },
                    { user_1 : friend.id }
                ]
            });

            if (test1 !== undefined)
                return (await this.friendRepository.remove(test1));
            else if (test2 !== undefined)
                return (await this.friendRepository.remove(test2));
        }
        catch (e) {
            return (e);
        } */
		return ("");
    }
}
