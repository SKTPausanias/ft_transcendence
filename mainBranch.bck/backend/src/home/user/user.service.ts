import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/home/user/user.entity';
import { Connection, Like, Repository } from 'typeorm';
import { Response } from '../../shared/response/responseClass';
import { ErrorParser } from '../../shared/utils/errorParser';
import { Exception } from '../../shared/utils/exception';
import { User } from './userClass';
import { SessionService } from 'src/session/session.service';
import { FriendService } from '../friends/friend.service';
import { UserPublicInfoI } from './userI';
import { ChatService } from '../chat/chat.service';
import { ChatUsersEntity } from '../chat/chatUsers.entity';

@Injectable()
export class UserService {

	constructor(@InjectRepository(UserEntity)
	private userRepository: Repository<UserEntity>,
	@InjectRepository(ChatUsersEntity)
	private chat_userRepository: Repository<ChatUsersEntity>,
	private friendService: FriendService,
	private connection: Connection,
	private sessionService: SessionService,
	private chatService: ChatService){}

	async findByLogin(login: string): Promise<UserEntity | undefined> {
		try {
			return await this.userRepository.findOne({ where: { login } });
		} catch (error) {
			throw new Exception(Response.makeResponse(404, {error : "User not found"}))
		}
	}
	async findByNickname(nickname: string): Promise<UserEntity | undefined> {
		try {
			return await this.userRepository.findOne({ where: { nickname } });
		} catch (error) {
			throw new Exception(Response.makeResponse(404, {error : "User not found"}))
		}
	}
	async findByEmail(email: string): Promise<UserEntity | undefined> {
		try{
			return await this.userRepository.findOne({ where: { email } });
		} catch (error) {
			throw new Exception(Response.makeResponse(500, {error : "User not found"}))
		}
	}

	async save(user: any): Promise<UserEntity | any>{
		try {
			return (await this.userRepository.save(user));
		} catch (error) {
			throw new Exception(Response.makeResponse(500, {error : ErrorParser.parseDbSaveExeption(error)}))
		}
	}
	async update(usrEntity: UserEntity, usr: any): Promise<UserEntity | any>{
		try {
			return (await this.userRepository.update(usrEntity, usr));
		} catch (error) {
			throw new Exception(Response.makeResponse(500, {error : ErrorParser.parseDbSaveExeption(error)}))
		}
	}
	async deleteUser(usr: any)
	{
		try {
			return (await this.userRepository.remove(usr));
		} catch (error) {
			throw new Exception(Response.makeResponse(500, {error : "Can't delete user"}))
		}
	}

	async findMatchByNickname(match: string, user: UserEntity)
    {
        try {
            const resp =  await this.userRepository.find({where: [
                            { nickname : Like(`%${match}%`)}]});
            return (User.getMultipleUserInfo(resp, user));
        }
        catch (error) {
            throw new Exception(Response.makeResponse(500, {error : "Can't find match"}));
        }
    }

	async findMatchByLoginNickname(match: string, user: UserEntity)
    {
        try {
            const resp =  await this.userRepository.find({where: [
                            { nickname : Like(`%${match}%`)},
                            { login : Like(`%${match}%`)}]});
            return (User.getMultipleUserInfo(resp, user));
        }
        catch (error) {
            throw new Exception(Response.makeResponse(500, {error : "Can't find match"}));
        }
    }

	async getUserInfo(header: any) //body
	{
		const token = header.authorization.split(' ')[1];
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			return (Response.makeResponse(200, User.getInfo(session.userID)));
		} catch (error) {
			return (Response.makeResponse(401, {error : "Unauthorized"}));
		}
	}
	async getOnlineUsers(header: any){
		const token = header.authorization.split(' ')[1];
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			const sessions = await this.sessionService.findAllExcept(session);
			return (Response.makeResponse(200, User.getOnlineUserInfo(sessions)))
		} catch (error) {
			return (Response.makeResponse(401, {error : "Unauthorized"}));
		}
	}

	//get all online friends of the user
	async getFriends(header: any): Promise<any> {
		try {
			const token = header.authorization.split(' ')[1];
			const session = await this.sessionService.findSessionWithRelation(token);
			const friends = await this.friendService.findAllFriends(session.userID);
			return (Response.makeResponse(200, friends));
		} catch (error) {
			return (error);
		}
	}

	async getAllInChannel(name_chat : string): Promise<UserPublicInfoI[]> {
		try {
			const chat = await this.chatService.findChatByName(name_chat);
			const chat_users = await this.chat_userRepository.find({relations: ["chat", "user"] , where: {chat}});
			var ret: UserPublicInfoI[] = [];
			chat_users.forEach(element => {
				ret.push(User.getPublicInfo(element.user));
			});
			return (ret);
		} catch (error) {
			throw new Exception(Response.makeResponse(500, {error : "Can't get users"}));
		}
	}
}
