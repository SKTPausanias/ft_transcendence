import { Injectable } from '@nestjs/common';
import { MailService } from 'src/shared/mail/mail.service';
import * as randomstring from 'randomstring';
import { HashService } from 'src/shared/hash/hash.service';
import { Confirmation } from 'src/auth/confirmation/confirmationC';
import { UserService } from 'src/shared/user/user.service';
import { User } from 'src/shared/user/userClass';
import { ConfirmService } from './confirmation/confirmation.service';
import { ErrorParser } from 'src/shared/utils/errorParser';
import { mDate } from 'src/shared/utils/date';
import { FtAuthService } from './ft_auth/ft_auth.service';
import { TwoFactorService } from './two-factor/two-factor.service';
import { UserRegI } from 'src/shared/user/userI';
import { Response } from 'src/shared/response/responseClass';
import { SessionService } from 'src/session/session.service';

@Injectable()
export class AuthService {
	constructor(
		private userService: UserService,
		private confirmService: ConfirmService,
		private mailService: MailService,
		private hashService: HashService,
		private ftAuthService: FtAuthService,
		private twoFactorService: TwoFactorService,
		private sessionService: SessionService
	) {}

	async login(usrData: any) {
		try {
			const resp = await this.userService.findByNickname(usrData.nickname);
			if (resp === undefined)
				return (Response.makeResponse(401, {error : "User or password incorrect"})); 
			if (resp.ft_id)
				return (Response.makeResponse(401, {error : "Try to login with 42"})); 
			if (!(await this.hashService.compare(usrData.password, resp.password)))
				return (Response.makeResponse(401, {error : "User or password incorrect"})); 
			if (!resp.confirmed)
				return (Response.makeResponse(301, { redirect: 'confirmation',  email: resp.email} )); 
			if (resp.factor_enabled)
				return (Response.makeResponse(301, { redirect: 'twoFactor',  email: resp.email} )); 
			return (await this.sessionService.signToken(resp));
		//	(Response.makeResponse(200, User.getInfo(resp)));
		} catch (error) {
			return (error);
		}
		
	}

	async ftLogin(code: string) {
		try {
			const userInfo = await this.ftAuthService.getUserData(code);
			const usrData = await this.userService.findByEmail(userInfo.email);
			if (usrData.factor_enabled)
				return (Response.makeResponse(301, { redirect: 'twoFactor',  email: usrData.email} ));
			if (usrData === undefined)				
				return (Response.makeResponse(401, {error : "User dosn't exist"}));
			return (await this.sessionService.signToken(usrData));
			//return (Response.makeResponse(200, User.getInfo(usrData)));
		} catch (error) {
			return (error);
		}
		
	}
	async signUp(usrData: UserRegI) {
		usrData.password = this.hashService.hash(usrData.password);
		try {
			const uResp = await this.userService.save(User.getUser(usrData));
			const code = randomstring.generate(50);
			const hashedCode = this.hashService.hash(code);
			await this.confirmService.save(new Confirmation(hashedCode, uResp));
			this.mailService.sendConfirmation(uResp.email, code);
			return (Response.makeResponse(301, { redirect: 'confirmation',  email: uResp.email} )); 
		} catch (Exception) {
			return (Exception);
		}
	}
	async ftSignUp(code: string) {
		const userData = await this.ftAuthService.getUserData(code);
		try {
			const resp = await this.userService.save(User.getFtUser(userData));
			return (await this.sessionService.signToken(resp));
			//return (Response.makeResponse(200, User.getInfo(resp)));
		} catch (Exception) {
			return (Exception);
		}
	}

	async confirm(confirmData: any) {
		try {
			const usr = await this.userService.findByEmail(confirmData.email);
			const confirmation = await this.confirmService.findOne(usr);
			if (!(await this.hashService.compare(confirmData.code, confirmation.confirmation_nb)))
				return (Response.makeResponse(403, {error : "Forbidden"})); 
				//return { error: 403 }; //Froibiden
			await this.confirmService.remove(confirmation); // confirmation link used remove it
			if (mDate.expired(confirmation.expiration_time)) {//confirmation expired?
				await this.userService.deleteUser(usr); //remove user from database
				return (Response.makeResponse(410, {error : "Gone"})); 
			}
			usr.confirmed = true;
			await this.userService.save(usr);
			if (usr.factor_enabled)
				await this.twoFactorService.newSecret(usr);
			return (Response.makeResponse(200, {}));
		} catch (error) {
			return (error);
		}
	}

	async resendConfirmation(email: string) {
		try {
		const usr = await this.userService.findByEmail(email);
		const confirmation = await this.confirmService.findOne(usr);
		const code = randomstring.generate(50);
		const hashedCode = this.hashService.hash(code);
		const newConf = new Confirmation(hashedCode, usr);
		confirmation.confirmation_nb = newConf.confirmation_nb;
		confirmation.expiration_time = newConf.expiration_time;
			await this.confirmService.save(confirmation);
			this.mailService.sendConfirmation(email, code);
			return (Response.makeResponse(200, { email: email} )); 
		} catch (Exception) {
			return  (Exception);
		}
	}
	async generateToken(email: string) {
		try {
			const usr = await this.userService.findByEmail(email);
			const token = await this.twoFactorService.generateToken(usr);
			console.log("returning token: ", token);
			return (token);
		} catch (error) {
			return (error);
		}
	}
	async validateToken(email, token: number) {
		try {
			const usr = await this.userService.findByEmail(email);
			if (await this.twoFactorService.validateToken(usr, token))
				return (await this.sessionService.signToken(usr));
				//return (Response.makeResponse(200, User.getInfo(usr)));
			return (Response.makeResponse(401, {error : "Unauthorized"})); 
		} catch (error) {
			return (error);
		}	
	}
	async logout(auth: string)
	{
		const token = auth.split(' ')[1];
		try {
			return (await this.sessionService.removeByToken(token));
		} catch (error) {
			return (error);
		}
	}
}
/*
{
	status : 200		status: 2..			status : !200
	data {}				data {				data {}
						redirect,					
						email
						...				
						}						
			
}
*/
