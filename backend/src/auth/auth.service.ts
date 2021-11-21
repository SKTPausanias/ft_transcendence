import { Injectable } from '@nestjs/common';
import { MailService } from 'src/shared/mail/mail.service';
import * as randomstring from 'randomstring';
import { HashService } from 'src/shared/hash/hash.service';
import { Confirmation } from 'src/auth/confirmation/confirmationC';
import { UserService } from 'src/home/user/user.service';
import { User } from 'src/home/user/userClass';
import { ConfirmService } from './confirmation/confirmation.service';
import { mDate } from 'src/shared/utils/date';
import { FtAuthService } from './ft_auth/ft_auth.service';
import { TwoFactorService } from './two-factor/two-factor.service';
import { UserRegI } from 'src/home/user/userI';
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
			const resp = await this.userService.findByLogin(usrData.login);
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
			resp.online = true;
			const usr = await this.userService.save(resp);
			return (await this.sessionService.signToken(usr));
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
			usrData.online = true;
			const usr = await this.userService.save(usrData);
			return (await this.sessionService.signToken(usr));
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
			resp.online = true;
			const usr = await this.userService.save(resp);
			return (await this.sessionService.signToken(usr));
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
			await this.mailService.sendValidationCode(email, token);
			return (token);
		} catch (error) {
			return (error);
		}
	}
	async validateToken(email, token: number) {
		try {
			const resp = await this.userService.findByEmail(email);
			if (await this.twoFactorService.validateToken(resp, token))
			{
				resp.online = true;
				const usr = await this.userService.save(resp);
				return (await this.sessionService.signToken(usr));
			}
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
			const session = await this.sessionService.findSessionWithRelation(token);
			const sessions = await this.sessionService.findByUser(session.userID);
			console.log("sessions: ", sessions.length);
			if (sessions.length == 1)
			{
				console.log("changing to offline");
				session.userID.online = false;
				await this.userService.save(session.userID);
			}else
				console.log("skipping...");
			return (await this.sessionService.removeByToken(token));
		} catch (error) {
			return (error);
		}
	}
	async checkSession(auth: string)
	{
		const token = auth.split(' ')[1];
		try {
			const resp = await this.sessionService.findSession(token);
			return (Response.makeResponse(200, {expiration_time: resp.expiration_time}))
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, {error: "Can't check session"}));
		}
	}
	async renewSession(auth: string)
	{
		const token = auth.split(' ')[1];
		try {
			const resp = await this.sessionService.findSession(token);
			return (Response.makeResponse(200, {expiration_time: resp.expiration_time}))
		} catch (error) {
			if (error.statusCode == 410)
				return (error);
			return (Response.makeResponse(500, {error: "Can't check session"}));
		}
	}
	/* async getQr() //TODO
	{
		
		const usr = await this.userService.findByLogin('dbelinsk');
		try {
			const qr =  (await this.twoFactorService.generateQr(usr));
			const qrImg = "<img src=" + qr +">";
			return (qrImg);
		} catch (error) {
			return (error);
		}
	} */
}

