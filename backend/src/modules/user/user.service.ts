import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, getConnection } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { users } from 'src/shared/entity/user.entity';
import { User } from './model/user/cUser';
import { UserI } from './model/user/iUser';
import { v4 as uuid} from 'uuid';


@Injectable()
export class UserService {

	user: User = new User();
	authHeader: {};
	code: string = "2699789f179e811f607174468c053236f3bc7200bdd9b5635e60d4a569c6d5d9";

	_GRANT_TYPE: string="grant_type=authorization_code&"
	_ID: string="client_id=54468a192544b06fef8e25a40d1e3d1febb65e21f600d6b57e1068e5aeba9823&"
	_SECRET: string="client_secret=5405c583abbbf06cbd9c6dc4a4c53144a2cb1ce5dfd47f3295dcd0a7ce9498f2&"
	_CODE: string="code=" + this.code + "&";
	_REDIRECT: string="redirect_uri=http://localhost:4200/auth"
	_URL: string="https://api.intra.42.fr/oauth/token?"
	req_url: string = this._URL + this._GRANT_TYPE + this._ID + this._SECRET;
	
    constructor (@InjectRepository(users)
            private repository: Repository<users>,
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
		//user.sayHello();
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
	async confirmUser(uniqueID: any) : Promise<users>
	{
		if (uniqueID === undefined)
			return (<UserI>{});

		const userData = await this.repository.findOne({where: {uuid: uniqueID}});
		
		if (userData === undefined)
			return (<UserI>{});
    	
		this.repository.save({...userData, status: 3});

		userData.status = 3;

		return (userData);
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
}
