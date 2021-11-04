import { Injectable } from '@nestjs/common';
import { SessionService } from 'src/session/session.service';
import { UserService } from '../user/user.service';
import { FriendService } from '../friends/friend.service';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class DashboardService {
    constructor(
		private friensService: FriendService,
        private sessionService: SessionService,
        private userService: UserService,
		private chatService : ChatService
        ){}
	async searchUser(match: string, header: any)
	{
		try {
            const token = header.authorization.split(' ')[1];
            const session = await this.sessionService.findSessionWithRelation(token);
            //return (await this.userService.findMatchByLoginNickname(match, session.userID));
			return (await this.userService.findMatchByNickname(match, session.userID));
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
			
			if (ret !== undefined && ret.confirmed == true){
				console.log("Entering to save group...");
				await this.chatService.saveChatGroup({chat_type: "private", members: [session.userID, friend]}, header.authorization);
				console.log("Accepted: ", ret);
			}
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
    }
}
