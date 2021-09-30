import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HashService } from 'src/shared/hash/hash.service';
import { Response } from 'src/shared/response/responseClass';
import { UserEntity } from 'src/shared/user/user.entity';
import { UserService } from 'src/shared/user/user.service';
import { UserI, UserInfoI } from 'src/shared/user/userI';
import { ErrorParser } from 'src/shared/utils/errorParser';
import { Exception } from 'src/shared/utils/exception';
import { Not, Repository } from 'typeorm';
import { SessionEntity } from './session.entity';
import * as randomstring from 'randomstring';
import { mDate } from 'src/shared/utils/date';
import { SessionI } from './sessionI';
import { Session } from './sessionClass';
import { User } from 'src/shared/user/userClass';
import { _ } from 'ajv';

@Injectable()
export class SessionService {

	expires_in: number = 60 * 60 * 2; //2 hours
	constructor(@InjectRepository(SessionEntity)
	private sessionRepository: Repository<SessionEntity>,
	private userService: UserService){}

	async newSession(user: UserEntity){

		const sessionObj: SessionI = <SessionI>{
			token: randomstring.generate(50),
			expiration_time: mDate.setExpirationTime(this.expires_in), // 2 hours;
			userID : user
		}
		try {
			return (await this.sessionRepository.save(sessionObj));
		} catch (error) {
			throw new Exception(Response.makeResponse(500, ErrorParser.parseDbSaveExeption(error)))

		}
	}
	async removeByToken(token: string)
	{
		try {
			return (await this.sessionRepository.delete({ token }))
		} catch (error) {
			throw new Exception(Response.makeResponse(500, {error: "Failed to delete data"}))

		}
	}

	async signToken(usr: UserEntity){
		try {
			var	session = await this.newSession(usr);
			return (Response.makeResponse(200, Session.getSesionToken(session)));
		} catch (error) {
			return (Response.makeResponse(500, ErrorParser.parseDbSaveExeption(error)))
		}
	}
	async getUserInfo(header: any) //body
	{
		const token = header.authorization.split(' ')[1];
		console.log(header);
		try {
				const session = await this.sessionRepository.findOne({ relations: ["userID"], where: { token }});
				if (mDate.expired(session.expiration_time))
				{
					await this.sessionRepository.delete(session);
					return (Response.makeResponse(410, {error : "Gone"}));
				}
				return (Response.makeResponse(200, User.getInfo(session.userID)));
		} catch (error) {
			return (Response.makeResponse(401, {error : "Unauthorized"}));
		}
	}
	async getOnlineUsers(header: any){
		const token = header.authorization.split(' ')[1];
		try {
			const session =  await this.sessionRepository.findOne({ where: { token } });
			if (mDate.expired(session.expiration_time))
				return (Response.makeResponse(410, {error : "Gone"}));
				const sessions = await this.sessionRepository.find({ 
					relations: ["userID"], where: { token : Not(token) }});
				const skip = await this.sessionRepository.findOne({
					relations: ["userID"], where: { token : token }});
				return (Response.makeResponse(200, User.getOnlineUserInfo(sessions, skip)))
		} catch (error) {
			console.log(error);
			return (Response.makeResponse(401, {error : "Unauthorized"}));
		}
	}
}
