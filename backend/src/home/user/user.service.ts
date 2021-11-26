import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionEntity } from 'src/session/session.entity';
import { UserEntity } from 'src/home/user/user.entity';
import { UserI, UserInfoI, UserRegI } from 'src/home/user/userI';
import { Connection, Like, Not, Repository } from 'typeorm';
import { Response } from '../../shared/response/responseClass';
import { ErrorParser } from '../../shared/utils/errorParser';
import { Exception } from '../../shared/utils/exception';
import { User } from './userClass';
import { SessionService } from 'src/session/session.service';
import { FriendService } from '../friends/friend.service';

@Injectable()
export class UserService {

	constructor(@InjectRepository(UserEntity)
	private userRepository: Repository<UserEntity>,
	private friendService: FriendService,
	private connection: Connection,
	private sessionService: SessionService){}

	async findById(id: number): Promise<UserEntity | undefined> {
		try {
			return await this.userRepository.findOne({ where: { id } });
		} catch (error) {
			throw new Exception(Response.makeResponse(404, {error : "User not found"}))
		}
	}async findByLogin(login: string): Promise<UserEntity | undefined> {
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
	/* async activateRoom(users: UserEntity[], roomId: number){
		users.forEach(async user => {
			if (user.active_chat_rooms)
			{
				if (user.active_chat_rooms.find(room => room == roomId) === undefined)
					user.active_chat_rooms.push(roomId);
			}
			else
				user.active_chat_rooms = [roomId];
			await this.save(user);
		});
	}
	async desactivateRoom(users: UserEntity[], roomId: number){
		users.forEach(async user => {
			user.active_chat_rooms = user.active_chat_rooms.filter(id => id != roomId);
			console.log("llega3");
			await this.save(user);
			console.log("llega4");
		});
	} */
}
