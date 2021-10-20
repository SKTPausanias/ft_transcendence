import { Injectable } from '@nestjs/common';
import { FriendService } from 'src/home/friends/friend.service';
import { UserService } from 'src/home/user/user.service';
import { User } from 'src/home/user/userClass';
import { SessionService } from 'src/session/session.service';
import { SessionDataI } from './iSocket';

@Injectable()
export class SocketService {

	constructor(private sessionService: SessionService,
				private friendService: FriendService,
				private userService: UserService){}

	async onConnect(token: string, socket_id: string): Promise<SessionDataI>{
		var sessionData = <SessionDataI>{}
		const session = await this.sessionService.findSessionWithRelation(token);
		session.socket_id = socket_id;
		await this.sessionService.save(session);
		sessionData.userInfo = User.getInfo(session.userID);
		sessionData.friends = await this.friendService.findAllFriends(session.userID);
		sessionData.friend_invitation = await this.friendService.findAllInvitations(session.userID);
		return (sessionData);
	}

	async emitToFriends(session_data: SessionDataI){
		session_data.friends.forEach(async element =>  {
			const friend = await this.userService.findByNickname(element.nickname);
			const friendSession = await this.sessionService.findByUser(friend);
			console.log("--->", friendSession);
		});
	}
}
