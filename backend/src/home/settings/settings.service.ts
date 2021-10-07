import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionEntity } from 'src/session/session.entity';
import { Response } from 'src/shared/response/responseClass';
import { SessionService } from 'src/session/session.service';
import { User } from 'src/home/user/userClass';
import { UserService } from '../user/user.service';

@Injectable()
export class SettingsService {
    constructor(
        private sessionService: SessionService,
        private userService: UserService
        ){}
		async deleteUser(header: any)
		{
			const token = header.authorization.split(' ')[1];
			try {
				const session = await this.sessionService.findSessionWithRelation(token);
				const resp = await this.userService.deleteUser(session.userID);
				return (Response.makeResponse(200, {ok : 'deleted'}));
			} catch (error) {
				console.log(error);
				return (Response.makeResponse(500, {error : 'unable to delete'}));
			}
		}
		async updateUser(usr: any, header: any){
			const token = header.authorization.split(' ')[1];
			try {
				const session = await this.sessionService.findSessionWithRelation(token);
				const resp = await this.userService.update(session.userID, usr);
				const updatedUser = await this.sessionService.findSessionWithRelation(token);
				return (Response.makeResponse(200, User.getInfo(updatedUser.userID)));
			} catch (error) {
				console.log(error);
				return (Response.makeResponse(500, {error : 'unable to delete'}));
			}
		}
		async updateUserAvatar(header: any, fname: string){
			const token = header.authorization.split(' ')[1];
			try {
				const session = await this.sessionService.findSessionWithRelation(token);
				var usr = User.getUser(session.userID);
				usr.avatar = process.env.BE_URL + '/img/' + fname;
				const resp = await this.userService.update(session.userID, usr);
				const updatedUser = await this.sessionService.findSessionWithRelation(token);
				return (Response.makeResponse(200, User.getInfo(updatedUser.userID)));
			} catch (error) {
				console.log(error);
				return (Response.makeResponse(500, {error : 'unable to delete'}));
			}
		}
		static filterHelper(req: Request, file, cb):any {
			//https://gabrieltanner.org/blog/nestjs-file-uploading-using-multer -> this should be on server side
			/*if (!file.name.match(/\.(jpg|jpeg|png|gif)$/)) {
				return cb(new Error('Only image files are allowed!'), false);
			}
			cb(null, true);*/
			const ext = (file.mimetype).substring(file.mimetype.indexOf('/') + 1);
			if ( ext !== 'png' && ext !== 'jpeg') {
			  return cb(null, false); // FileIntercepter is completely ignoring this when thrown an Error exception as first argument.
			}
			return cb(null, true);
		}
		static fileNemaHelper(req, file, cb):void {
			//console.log("Value of req: ", req);
			cb(null, file.originalname)
		}
	
		static destinationHelper(req, file, cb): void {
			cb(null, './public/img');
		}
	
		static limitFilesHelper(): number {
			return (1);
		}
		static limitSizeHelper(): number {
			return (2000000);
		}
}
