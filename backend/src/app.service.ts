import { Injectable, HttpService } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class AppService {


	code: string = "5a643570cb7809cf917c6ab8e60c809f31e9357bb7e398d0f21dd21fa67612a7";

	_GRANT_TYPE: string="grant_type=authorization_code&"
	_ID: string="client_id=54468a192544b06fef8e25a40d1e3d1febb65e21f600d6b57e1068e5aeba9823&"
	_SECRET: string="client_secret=5405c583abbbf06cbd9c6dc4a4c53144a2cb1ce5dfd47f3295dcd0a7ce9498f2&"
	_CODE: string="code=" + this.code + "&";
	_REDIRECT: string="redirect_uri=http://localhost:4200"
	_URL: string="https://api.intra.42.fr/oauth/token?"

	req_url: string = this._URL + this._GRANT_TYPE + this._ID + this._SECRET + this._CODE + this._REDIRECT;
	tok: string = "";
	constructor(private readonly httpService: HttpService) {}
	getHello():  string 
	{
    	 this.getAccessToken().source.subscribe(item =>{
			console.log("ACCESS TOKEN = " + item.data.access_token);
			this.tok = (item.data.access_token);
			console.log("--->" + this.tok + "<---- && type = " + typeof(this.tok));
		});
		return (this.tok);
  	}
  	getAccessToken():  Observable<AxiosResponse<object>> {
	return this.httpService
	.post(this.req_url)
	.pipe(
		map((axiosResponse: AxiosResponse) => {
		return axiosResponse.data;
		}),
	);
	
  }
  getRand(): string{
	return ("123");
}
}
