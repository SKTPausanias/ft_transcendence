import { Injectable, HttpService } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class AppService {


	code: string = "2699789f179e811f607174468c053236f3bc7200bdd9b5635e60d4a569c6d5d9";

	_GRANT_TYPE: string="grant_type=authorization_code&"
	_ID: string="client_id=54468a192544b06fef8e25a40d1e3d1febb65e21f600d6b57e1068e5aeba9823&"
	_SECRET: string="client_secret=5405c583abbbf06cbd9c6dc4a4c53144a2cb1ce5dfd47f3295dcd0a7ce9498f2&"
	_CODE: string="code=" + this.code + "&";
	_REDIRECT: string="redirect_uri=http://localhost:4200"
	_URL: string="https://api.intra.42.fr/oauth/token?"

	req_url: string = this._URL + this._GRANT_TYPE + this._ID + this._SECRET;// + this._CODE + this._REDIRECT;
	tok: Promise<string>;
	result: Promise<string>;
	constructor(private readonly httpService: HttpService) {}

	async getHello():  Promise<string>
	{
		return ("Hello World");
  	}
 
	async getLoginInfo(code:string):  Promise<any>
	{
		const some = await this.getAccessToken(code);
		const userId = await this.getUserId(some);
		const userLogin = await this.getUserLogin(some, userId);
		return (userLogin);
	}
	async getAccessToken(code:string): Promise<string>
	{
		this.req_url += "code=" + code + "&" + this._REDIRECT;
		const response = await this.httpService.post(
		this.req_url,
		).toPromise();
		return response.data.access_token;
	}
	async getUserId(code: string): Promise<string>
	{
		const url = "https://api.intra.42.fr/oauth/token/info";
		const headersRequest = {
			'Authorization': 'Bearer ' + code,
		};
		const response = await this.httpService.get(url, { headers: headersRequest }).toPromise();
		return response.data.resource_owner_id;
	}
	async getUserLogin(code: string, userId: string): Promise<any> {
		const url = "https://api.intra.42.fr/v2/users/" + userId + "/";
		const headersRequest = {
			'Authorization': 'Bearer ' + code,
		};
		const response = await this.httpService.get(url, { headers: headersRequest }).toPromise();
		return response.data;
	}

}
