import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionEntity } from 'src/session/session.entity';
import { UserEntity } from 'src/home/user/user.entity';
import { UserI, UserRegI } from 'src/home/user/userI';
import { Connection, Like, Not, Repository } from 'typeorm';
import { Response } from '../../shared/response/responseClass';
import { ErrorParser } from '../../shared/utils/errorParser';
import { Exception } from '../../shared/utils/exception';
import { User } from './userClass';
import { SessionService } from 'src/session/session.service';
import { toHash } from 'ajv/dist/compile/util';
import { FriendEntity } from '../chat/chat.entity';

@Injectable()
export class UserService {

	constructor(@InjectRepository(UserEntity)
	private userRepository: Repository<UserEntity>,
	@InjectRepository(FriendEntity)
	private friendRepository: Repository<FriendEntity>,
	private connection: Connection,
	private sessionService: SessionService){}

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

	async save(user: UserRegI): Promise<UserEntity | any>{
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
	async getOnlineFriends(header: any){
		const token = header.authorization.split(' ')[1];
		try {
			console.log("whatup")
			const session = await this.sessionService.findSessionWithRelation(token);
			//session.userID.id
			const friendsOnline = await this.friendRepository.find({where: [ session.userID.id]});
			console.log("friends:", friendsOnline[0]); // user_id does not show. tenemos que sacarlo de la relacion de amistad
			//return friendsOnline;
			return "";
			//const sessions = await this.sessionService.findAllExcept(session);
			//return (Response.makeResponse(200, User.getOnlineUserInfo(sessions)))
		} catch (error) {
			return (Response.makeResponse(401, {error : "Unauthorized"}));
		}
	}
}
