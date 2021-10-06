import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionEntity } from 'src/session/session.entity';
import { UserEntity } from 'src/shared/user/user.entity';
import { UserI, UserRegI } from 'src/shared/user/userI';
import { Connection, Not, Repository } from 'typeorm';
import { Response } from '../response/responseClass';
import { ErrorParser } from '../utils/errorParser';
import { Exception } from '../utils/exception';
import { User } from './userClass';

@Injectable()
export class UserService {

	constructor(@InjectRepository(UserEntity)
	private userRepository: Repository<UserEntity>,
	private connection: Connection){}

	async findByLogin(login: string): Promise<UserEntity | undefined> {
		try {
			return await this.userRepository.findOne({ where: { login } });
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
	async findBySession(session: SessionEntity): Promise<UserEntity | undefined> {
		try{
			const mr = this.connection.getRepository(SessionEntity);

			const users = await mr.find({ relations: ["userID"], where: {token: session.token}});
			const realUser = await this.findByLogin(users[0].userID.login);
			console.log(users);
			console.log("--->", realUser.login);
			const resp =  await this.userRepository.findOne({ where : { sesionID: session.userID } });
			console.log("user finded by session: ", resp);
			return resp;
		} catch (error) {
			console.log(error);
			throw new Exception(Response.makeResponse(500, {error : "User not found"}))
		}
	}

	async findAllOnlineUsers(session: SessionEntity){
		try {
			return (await this.userRepository.find( {where: {sesionID: Not(session.userID)}}));
		} catch (error) {
			throw new Exception(Response.makeResponse(500, {error : ErrorParser.parseDbSaveExeption(error)}))
		}
	}

	async save(user: UserRegI): Promise<UserEntity | any>{
		try {
			return (await this.userRepository.save(user));
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
}
