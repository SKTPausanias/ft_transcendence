import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { HttpService } from '@nestjs/axios';
import { Exception } from "src/shared/utils/exception";
import { Response } from "src/shared/response/responseClass";

@Injectable()
export class FtAuthService {


	authHeader: any;
	req_url: string;
	constructor(private httpService: HttpService){
		this.req_url = process.env.FT_TOKEN_URL + '?' +
						process.env.FT_GRANT_TYPE + '&' +
						process.env.FT_ID + '&' +
						process.env.FT_SECRET + '&';
	}
	async getUserData(code: string){
		try {
			await this.setAuthHeader(code);
			const token_info = await this.getTokenInfo();
			const user_info = await this.getUserInfo(token_info);
			return user_info;
		} catch (error) {
			throw new Exception(Response.makeResponse(500, {error : "Can't get 42 user data"}));
		}
	}
	async setAuthHeader(code:string)
	{
		const url = this.req_url + "code=" + code + "&" + process.env.FT_REDIRECT;
		const response = await (await firstValueFrom(this.httpService.post(url))).data;
		this.authHeader = {'Authorization': response.token_type + ' ' + response.access_token};
	}
	async getTokenInfo(): Promise<any>
	{
	 	const url = process.env.FT_TOKEN_INFO_URL;
		return ((await firstValueFrom(this.httpService.get(url, { headers: this.authHeader } ))).data);
	}
	async getUserInfo(token_info: any): Promise<any> 
	{
		const url = process.env.FT_USERS_URL + token_info.resource_owner_id + "/";
		return ((await firstValueFrom(this.httpService.get(url,  { headers: this.authHeader } ))).data);
	}
}