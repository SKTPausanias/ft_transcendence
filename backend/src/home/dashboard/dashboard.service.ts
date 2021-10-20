import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionService } from 'src/session/session.service';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { FriendEntity } from '../friends/friend.entity'
import { FriendService } from '../friends/friend.service';
import { Exception } from 'src/shared/utils/exception';
import { Response } from 'src/shared/response/responseClass';
import { SocketGateway } from 'src/socket/socket.gateway';
import { wSocket } from 'src/socket/eSocket';

@Injectable()
export class DashboardService {
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
			const ret =  await this.friensService.addFriend(session.userID, friend);
			return (ret);
		} catch (error) {
			return (error);
		}
	}
	
    async removeFriend(user, header): Promise<any> {
		try {
			const token = header.authorization.split(' ')[1];
			const session = await this.sessionService.findSessionWithRelation(token);	
			const friend = await this.userService.findByNickname(user.nickname);
			const ret = await this.friensService.removeFriend(session.userID, friend);
			return (ret);
		} catch (error) {
			return (error);
		}
		return ("");
    }
}
