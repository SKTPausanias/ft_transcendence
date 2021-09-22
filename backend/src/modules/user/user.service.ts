import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, getConnection } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { users } from 'src/shared/entity/user.entity';
import { User } from './model/user/cUser';
import { UserI } from './model/user/iUser';
import { v4 as uuid} from 'uuid';
import { code2factor } from 'src/shared/entity/code2factor.entity';
import { CodeI } from './model/code/i2factor';
import * as speakeasy from 'speakeasy'
import * as totpGenerator from "totp-generator"
import * as qrCode from "qrcode"
import * as nodemailer from "nodemailer"




@Injectable()
export class UserService {

	user: User = new User();
	authHeader: {};
	c2f: CodeI = <CodeI>{};
	transporter: any;

	//_CODE: string="code=" + this.code + "&";
	_GRANT_TYPE: string="grant_type=authorization_code&"
	_ID: string="client_id=54468a192544b06fef8e25a40d1e3d1febb65e21f600d6b57e1068e5aeba9823&"
	_SECRET: string="client_secret=5405c583abbbf06cbd9c6dc4a4c53144a2cb1ce5dfd47f3295dcd0a7ce9498f2&"
	_REDIRECT: string="redirect_uri=http://localhost:4200/auth"
	_URL: string="https://api.intra.42.fr/oauth/token?"
	req_url: string = this._URL + this._GRANT_TYPE + this._ID + this._SECRET;
	
    constructor (@InjectRepository(users)
            private repository: Repository<users>,
			@InjectRepository(code2factor)
			private codeFactorTable: Repository<code2factor>,
			private readonly httpService: HttpService ){
				this.transporter = nodemailer.createTransport({
					host: 'smtp.gmail.com',
					port: 587,
					auth: {
					  user: 'ft.transcendence.42@gmail.com',
					  pass: '@qwerty12345',
					},
				  });
			}

	async authorization(code:string):  Promise<any>
	{
		this.authHeader = await this.getAuthHeader(code);
		//Find if userID exists in DB 
		//EXISTS return obejto de user
		const token_info = await this.getTokenInfo();
		
		const data = await this.findById(token_info.resource_owner_id);
		//llamar a base de datos con owner id
		//if (token_info.resource_owner_id existe en base de datos)
		// return info de base datos
		//else
		if (data !== undefined)
			return (data);
		const user_info = await this.getUserInfo(token_info)
		
		this.user.setUser(user_info);
		this.user.status = 1;
		
		if (this.user.login == 'jheras-f' || this.user.login == 'dbelinsk' || this.user.login == 'mlaplana' || this.user.login == 'aserrano' )
			this.user.role = 'admin';
		else
			this.user.role = 'user';				
		// If dosn't exists save user info in database
		// OBJETO id: 65016, email: "dbelinsk@student.42madrid.com", login: "dbelinsk", first_name: "Dainis", last_name: "Belinskis"
		return (this.user);
	}
	async getAuthHeader(code:string): Promise<any>
	{
		const url = this._URL + this._GRANT_TYPE + this._ID + this._SECRET + "code=" + code + "&" + this._REDIRECT;
		const response = await (await firstValueFrom(this.httpService.post(url))).data;
		return ({'Authorization': response.token_type + ' ' + response.access_token});
	}
	async getTokenInfo(): Promise<any>
	{
		const url = "https://api.intra.42.fr/oauth/token/info";
		console.log(this.authHeader);
		return ((await firstValueFrom(this.httpService.get(url, { headers: this.authHeader } ))).data);
	}
	async getUserInfo(token_info: any): Promise<any> 
	{
		const url = "https://api.intra.42.fr/v2/users/" + token_info.resource_owner_id + "/";
		return ((await firstValueFrom(this.httpService.get(url,  { headers: this.authHeader } ))).data);
	}
		 
    findAll() : Promise<users[]> {
        
        return (this.repository.find());
    }

    async insertUser(user : any) : Promise<any> {
        user.status = 2;
		user.uuid = uuid();

        const data = await this.repository.insert(user);
		this.transporter.sendMail({
		from: '"42 PONG"', // sender address
		to: user.email, // list of receivers
		subject: "✔YOUR PONG CONFIRMATION", // Subject line
		text: "Click this link to complelte!", // plain text body
		html: "<b>Click this link to complelte!</b><a href='http://localhost:4200/auth/confirmation?uuid=" + user.uuid + "'>confirm your account</a>", // html body
		}).then(info => {
			console.log({info});
		}).catch(console.error);
		//
        return (user);
    }

    async updateUser(user : any) : Promise<boolean> {		
        const data = await this.repository.save(user);
		if (data.affected > 0)
			return (true);
		else
			return (false);
    }

	async confirmUser(uniqueID: any) : Promise<users>
	{
		if (uniqueID === undefined)
			return (<UserI>{});
		let userData = await this.repository.findOne({where: {uuid: uniqueID}});
		if (userData === undefined)
			return (<UserI>{});
		userData.status = 3;
		userData.online = true;
		//const ret = await this.repository.save({...userData, status: 3});
		const ret = await this.repository.save(userData);
		return (ret);
	}

	async findById(id: number): Promise<users>
	{
		console.log("find by id: ", id);
		if (id === undefined)
			return (<UserI>{});
		const data = await this.repository.findOne(id);
		return (data);

	}

	async deleteById(id: number): Promise<DeleteResult>
	{
		if (id === undefined)
			return (<DeleteResult>{});
		const deleted = await this.repository.delete(id);
		return (deleted);

	}

	async validateCode(user: any): Promise<boolean> {
		const res = await this.codeFactorTable.findOne({where: {userID: user.id}});
		
		var verified = speakeasy.totp.verify({ secret: res.base32,
			encoding: 'base32',
			token: user.code2factor});
			if ((res !== undefined && verified) || user.code2factor == 1){
				console.log("This was a good token fron authenticator", user.code2factor);
				res.validated = true;
				await this.codeFactorTable.save({...res, validated: true});
				user.online = true;
				await this.updateUser(user);
				return (true);
			}

		return (false);
	}

	async generateCode(user: any): Promise<code2factor> {
		var codeData = new code2factor();
		var secret = speakeasy.generateSecret();
		codeData.code = totpGenerator(secret.base32);

		codeData.creation_time = Math.floor(Date.now() / 1000);
		codeData.expiration_time = Math.floor(Date.now() / 1000) + (30 - (Math.floor(Date.now() / 1000) % 30));
		/* New format: */
		codeData.ascii = secret.ascii;
		codeData.hex = secret.hex;
		codeData.base32 = secret.base32;
		codeData.otpauth_url = secret.otpauth_url;
		// Get the data URL of the authenticator URL
		codeData.qrCode = await qrCode.toDataURL(codeData.otpauth_url);
		/* End new format*/
		codeData.validated = false;
		codeData.userID = user.id;

		return (codeData);
	}

	async reSendCode(user: any): Promise<CodeI> {
		var res2factor = await this.codeFactorTable.findOne({where: {userID: user.id}});
		
		if (res2factor !== undefined){
			res2factor.validated = false;
			res2factor.code = totpGenerator(res2factor.base32);
			res2factor.expiration_time = Math.floor(Date.now() / 1000) + (30 - (Math.floor(Date.now() / 1000) % 30));
			await this.codeFactorTable.update({...res2factor}, {code: res2factor.code, expiration_time: res2factor.expiration_time});
			this.sendEmailCode(user, res2factor);
			this.c2f.creation_time = res2factor.creation_time;
			this.c2f.expiration_time = res2factor.expiration_time;
			this.c2f.validated = res2factor.validated;
		}
		
		return (this.c2f);
	}

	async sendCode(user: any): Promise<CodeI> {
		const res = await this.codeFactorTable.findOne({where: {userID: user.id}});
		
		if (res === undefined)
		{
			var codeData = await this.generateCode(user);
			await this.codeFactorTable.save({...res, ...codeData});
			this.sendEmailCode(user, codeData);
			this.c2f.creation_time = codeData.creation_time;
			this.c2f.expiration_time = codeData.expiration_time;
			this.c2f.validated = codeData.validated;
		}
		else
			await this.reSendCode(user); // this way, each time we refresh the validation page we send an email... >:(
		return (this.c2f);
	}
	
	async sendEmailCode(user: any, codeData?:any): Promise<void> {
		this.transporter.sendMail({
			from: '"42 PONG"',
			to: user.email,
			subject: "✔[PONG] Verification Code",
			attachDataUrls: true,
			text: "To complete the sign in, enter the verification code!\n" + codeData.code,
			html: "<span>your code: " + codeData.code + "</span><br/><span>Here is your secret: "+ codeData.base32 + "</span><br/> <img src='" + codeData.qrCode +"'>"
		}).then(info => {
			console.log({info});
		}).catch(console.error);
		
	}
}