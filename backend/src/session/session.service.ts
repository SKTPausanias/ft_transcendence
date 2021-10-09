import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'src/shared/response/responseClass';
import { UserEntity } from 'src/home/user/user.entity';
import { UserService } from 'src/home/user/user.service';
import { ErrorParser } from 'src/shared/utils/errorParser';
import { Exception } from 'src/shared/utils/exception';
import { Not, Repository } from 'typeorm';
import { SessionEntity } from './session.entity';
import * as randomstring from 'randomstring';
import { mDate } from 'src/shared/utils/date';
import { SessionI } from './sessionI';
import { Session } from './sessionClass';
import { _ } from 'ajv';

@Injectable()
export class SessionService {

	expires_in: number = 10;// 60 * 60 * 2; //2 hours
	constructor(@InjectRepository(SessionEntity)
	private sessionRepository: Repository<SessionEntity>){}

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
	async reNewSession(session: SessionEntity, renew: boolean)
	{
		if (session === undefined)
			return (false);
		if (mDate.expired(session.expiration_time))
		{
			await this.sessionRepository.delete(session);
			return (false);
		}
		if (!renew)
			return (true);
		try {
			session.expiration_time = mDate.setExpirationTime(this.expires_in);
			await this.sessionRepository.save(session);
			return (true);
		} catch (error) {
			return (false)
		}
	}
	async findSession(token: string, renew: boolean)
	{
		var session;
		try {
			session = await this.sessionRepository.findOne({ where: { token }});
		} catch (error) {
			return (Response.makeResponse(500, {error : error}))
		}
		if (!await this.reNewSession(session, renew))
			throw new Exception(Response.makeResponse(410, {error : "Gone"}));
		return (session);
	}
	async findSessionWithRelation(token: string)
	{
		var session;
		try {
			session = await this.sessionRepository.findOne({ 
				relations: ["userID"], where: { token }});
		} catch (error) {
			return (Response.makeResponse(500, {error : error}))
		}
		if (!await this.reNewSession(session, true))
			throw new Exception(Response.makeResponse(410, {error : "Gone"}));
		return (session);
	}
	async findAllExcept(curentSesion: SessionEntity)
	{
		const sessions = await this.sessionRepository.find({ 
			relations: ["userID"], where: { 
				userID: Not(curentSesion.userID.id)
			}});
		return (sessions);
	}
}
