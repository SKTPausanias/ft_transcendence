import { Injectable } from '@nestjs/common';
import { ChatService } from 'src/home/chat/chat.service';
import { FriendService } from 'src/home/friends/friend.service';
import { UserEntity } from 'src/home/user/user.entity';
import { UserService } from 'src/home/user/user.service';
import { User } from 'src/home/user/userClass';
import { UserPublicInfoI } from 'src/home/user/userI';
import { SessionService } from 'src/session/session.service';
import { wSocket } from './eSocket';
import { SessionDataI } from './iSocket';

@Injectable()
export class SocketService {

	constructor(private sessionService: SessionService,
				private friendService: FriendService,
				private userService: UserService,
				private chatService: ChatService){}

	async getSessionData(token: string, socket_id: string): Promise<SessionDataI>{
		var sessionData = <SessionDataI>{}
		const session = await this.sessionService.findSessionWithRelation(token);
		session.socket_id = socket_id;
		await this.sessionService.save(session);
		sessionData.userInfo = User.getInfo(session.userID);
		sessionData.friends = await this.friendService.findAllFriends(session.userID);
		sessionData.friend_invitation = await this.friendService.findAllInvitations(session.userID);
		return (sessionData);
	}


	async closeSession(token: string){
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			const sessions = await this.sessionService.findByUser(session.userID);
			if (sessions.length)
			session.userID.online = false;
			await this.userService.save(session.userID);
			await this.sessionService.removeByToken(token);	
		} catch (error) {
			console.log(error);
		}
	}

	async hasActiveSessions(token: string): Promise<boolean>{
		const session = await this.sessionService.findSessionWithRelation(token);
		const sessions = await this.sessionService.findByUser(session.userID);
		return (sessions.length - 1 > 0);
	}

	async emitToAllFriends(server: any, action: string, emiter: string, recivers: UserPublicInfoI[], data: any){
		recivers.forEach(async element =>  {
			const friend = await this.userService.findByLogin(element.login); //UserEntity
			const friendSession = await this.sessionService.findByUser(friend);		//SesionEntity
			friendSession.forEach(element => {
				server.to(element.socket_id).emit(action, emiter, data);
			});
		});
	}
	async emitToOneFriend(server: any, action: string, emiter: string, reciver: UserPublicInfoI, data: any)
	{
		const friend = await this.userService.findByLogin(reciver.login);
		const friendSession = await this.sessionService.findByUser(friend);
		friendSession.forEach(element => {
			server.to(element.socket_id).emit(action, emiter, data);
		});
	}
	async emitToSelf(server: any, action: string, emiter: string, data: any){
		const me = await this.userService.findByLogin(emiter);
		const selfSession = await this.sessionService.findByUser(me);
		selfSession.forEach(element => {
			server.to(element.socket_id).emit(action, emiter, data);
		});
	}
	async emitToAll(server: any, action: string, emiter: string, recivers: UserPublicInfoI[], data: any)
	{
		recivers.forEach(async reciver => {
			const user = await this.userService.findByLogin(reciver.login);
			const sessions = await this.sessionService.findByUser(user);
			sessions.forEach(session => {
				server.to(session.socket_id).emit(action, emiter, data);
			});
		});
	}
	async emitToOneSession(server: any, action: string, token: string, data: any)
	{
		const session = await this.sessionService.findSession(token);
		console.log("emiting to: ", session.socket_id);
		server.to(session.socket_id).emit(action, session.userID.login, data);
	}
	
}
