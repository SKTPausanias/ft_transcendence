import { Injectable } from '@nestjs/common';

import { Response } from 'src/shared/response/responseClass';
import { SessionService } from 'src/session/session.service';
import { User } from 'src/home/user/userClass';
import { UserService } from '../user/user.service';
import { TwoFactorService } from 'src/auth/two-factor/two-factor.service';
import { MailService } from 'src/shared/mail/mail.service';
import * as fs from 'fs'
import { FriendService } from '../friends/friend.service';

@Injectable()
export class SettingsService {
    constructor(
        private sessionService: SessionService,
        private userService: UserService,
		private twoFactorService: TwoFactorService,
		private mailService: MailService,
		//private socketService: SocketGateway,
		private friendService: FriendService
        ){}
		async deleteUser(header: any)
		{
			const token = header.authorization.split(' ')[1];
			try {
				const session = await this.sessionService.findSessionWithRelation(token);
				const friends = await this.friendService.findAllFriends(session.userID);
				const resp = await this.userService.deleteUser(session.userID);
				//this.socketService.emitDeleteAccount(session, friends);
				return (Response.makeResponse(200, {ok : 'deleted'}));
			} catch (error) {
				console.log(error);
				return (Response.makeResponse(500, {error : 'unable to delete'}));
			}
		}
		async updateUser(user: any, header: any){
			const token = header.authorization.split(' ')[1];
			try {
				console.log("Update user");
				const session = await this.sessionService.findSessionWithRelation(token);
				/* if (session.userID.factor_enabled && !user.factor_enabled)
					await this.twoFactorService.removeSecret(session.userID); */
				session.userID.factor_enabled = user.factor_enabled;
				session.userID.email = user.email;
				session.userID.nickname = user.nickname;
				await this.userService.save(session.userID);
				const updatedUser = await this.sessionService.findSessionWithRelation(token);
				//this.socketService.emitUserUpdate(wSocket.USER_UPDATE, updatedUser);
				return (Response.makeResponse(200, User.getInfo(updatedUser.userID)));
			} catch (error) {
				if (error.statusCode === 410)
					return (error);
				return (Response.makeResponse(500, {error : 'unable to update'}));
			}
		}
		async updateUserAvatar(header: any, fname: string){
			const token = header.authorization.split(' ')[1];
			try {
				const session = await this.sessionService.findSessionWithRelation(token);
				var usr = User.getUser(session.userID);
				usr.avatar = process.env.BE_URL + '/img/' + fname;
				this.deleteFile(session.userID.avatar, usr.avatar);
				const resp = await this.userService.update(session.userID, usr);
				const updatedUser = await this.sessionService.findSessionWithRelation(token);
				//this.socketService.emitUserUpdate(wSocket.USER_UPDATE, updatedUser);
				return (Response.makeResponse(200, User.getInfo(updatedUser.userID)));
			} catch (error) {
				if (error.statusCode === 410)
					return (error);
				return (Response.makeResponse(500, {error : 'unable to delete'}));
			}
		}
		async sendCode(header: any)
		{
			try {
				const token = header.authorization.split(' ')[1];
				const session = await this.sessionService.findSessionWithRelation(token);
				const code = await this.twoFactorService.generateToken(session.userID);
				await this.mailService.sendValidationCode(session.userID.email, code);
				return (Response.makeResponse(200, {ok : "code successfuly has been sended"}));
			} catch (error) {
				if (error.statusCode == 410)
					return (error);
				return (Response.makeResponse(500, {error : 'unable to send code'}));
			}
				
		}
		async showQr(header: any, body: any){
			try {
				const token = header.authorization.split(' ')[1];
				const session = await this.sessionService.findSessionWithRelation(token);
				const validate = await this.twoFactorService.validateToken(session.userID, body.code)
				console.log(validate, body.code);
				if (!validate)
					return (Response.makeResponse(401, {error : 'Code is not valid!'}));
				const qr = await this.twoFactorService.generateQr(session.userID);
				return (Response.makeResponse(200, {qr}));
			} catch (error) {
				if (error.statusCode == 410)
					return (error);
				return (Response.makeResponse(500, {error : 'unable to show qr'}));
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
		deleteFile(path: string, path2: string){
			if (path == path2 || path.indexOf("default_avatar") >= 0)
				return ;
			var del = path.substring(process.env.BE_URL.length);
			del = process.cwd() + '/public/' + del;
			try {
				fs.unlinkSync(del);
				console.log("DELETED");
			} catch(err) {
				console.error(err)
			}
		}
}
