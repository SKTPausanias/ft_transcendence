import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/model/class/cUser';
import { UserI } from 'src/model/interface/iUser';
import { Repository } from 'typeorm';
import { users } from '../../entity/user.entity';
import { firstValueFrom } from 'rxjs';


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
		console.log(token_info);
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
		if (this.user.login == 'jheras-f' || this.user.login == 'dbelinsk' || this.user.login == 'mlaplana' )
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
        const data = await this.repository.insert(user);
		console.log("insertUser data= ", data);
        return (user);
    }
	confirmUser(user: any) : Promise<any>
	{
		user.status = 3;
		this.repository.save({...user, id: user.id})
		return (user);
	}

	async findById(id: number): Promise<users>
	{
		if (id === undefined)
			return (<UserI>{});
		console.log("lets find: " , id);
		const data = await this.repository.findOne(id);
		console.log("findByID: ", data);
		return (data);

	}
}
