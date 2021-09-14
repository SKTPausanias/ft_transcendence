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
import { randomInt } from 'crypto';
import { CodeI } from './model/code/i2factor';



@Injectable()
export class UserService {

	user: User = new User();
	authHeader: {};
	c2f: CodeI = <CodeI>{};

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
			private readonly httpService: HttpService ){}

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
		console.log(user);
        user.status = 2;
		user.uuid = uuid();

        const data = await this.repository.insert(user);
		//TODO SEND EMAIL
		//API key does not start with "SG.".
		const nodemailer = require('nodemailer');

		const transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 587,
			auth: {
			  user: 'ft.transcendence.42@gmail.com',
			  pass: '@qwerty12345',
			},
		  });


		transporter.sendMail({
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

    async updateUser(user : any) : Promise<any> {
        const data = await this.repository.update(this.user, user);
        return (user);
    }

	async confirmUser(uniqueID: any) : Promise<users>
	{
		if (uniqueID === undefined)
			return (<UserI>{});
		let userData = await this.repository.findOne({where: {uuid: uniqueID}});
		if (userData === undefined)
			return (<UserI>{});
		const ret = await this.repository.save({...userData, status: 3});
		return (ret);
	}

	async findById(id: number): Promise<users>
	{
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
		
		console.log("Llego", res.code, " -> ", user.code2factor);
		if (res !== undefined && res.expiration_time > Math.round(Date.now() / 1000) && res.code == user.code2factor){
			res.validated = true;
			this.codeFactorTable.save({...res, validated: true});
			console.log("Codes match: ", user.code2factor, res.code);
			return (true);
		}

		return (false);
	}

	generateCode(user: any): code2factor {
		var codeData = new code2factor();
		
		var rcode: string = "";
		for (var i = 0; i < 6; i++)
			rcode += String(randomInt(0, 9));
		codeData.code = rcode;
		codeData.creation_time = Math.round(Date.now() / 1000);
		codeData.expiration_time = codeData.creation_time + (120);
		codeData.validated = false;
		codeData.userID = user.id;

		return (codeData);
	}

	async reSendCode(user: any): Promise<CodeI> {
		var codeData = this.generateCode(user);
		const res2factor = await this.codeFactorTable.findOne({where: {userID: user.id}});
		if (res2factor !== undefined){
			console.log("re-sent new code: ", codeData.code);
			await this.codeFactorTable.save({...res2factor,...codeData});
			this.sendEmailCode(user, codeData);
			this.c2f.creation_time = codeData.creation_time;
			this.c2f.expiration_time = codeData.expiration_time;
			this.c2f.validated = codeData.validated;
		}
		
		return (this.c2f);
	}

	async sendCode(user: any): Promise<CodeI> {
		const res = await this.codeFactorTable.findOne({where: {userID: user.id}});
		var codeData = await this.generateCode(user);
		
		if (res === undefined || res.validated == true)
		{
			console.log("insert this new code: ", codeData.code);			
			await this.codeFactorTable.save({...res, ...codeData});
			this.sendEmailCode(user, codeData);
			this.c2f.creation_time = codeData.creation_time;
			this.c2f.expiration_time = codeData.expiration_time;
			this.c2f.validated = codeData.validated;
		}
		return (this.c2f);
	}
	
	async sendEmailCode(user: any, codeData?:any): Promise<void> {
		
		const nodemailer = require('nodemailer');

		const transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 587,
			auth: {
			  user: 'ft.transcendence.42@gmail.com',
			  pass: '@qwerty12345',
			},
		  });

		transporter.sendMail({
			from: '"42 PONG"',
			to: user.email,
			subject: "✔[PONG] Verification Code",
			text: "To complete the sign in, enter the verification code!\n" + codeData.code
		}).then(info => {
			console.log({info});
		}).catch(console.error);
		
	}
}
