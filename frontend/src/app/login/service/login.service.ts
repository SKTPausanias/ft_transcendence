import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'


@Injectable({
  providedIn: 'root'
})
export class LoginService {

	constructor(private http:HttpClient) { }
	url: string = '/api/login';
	async getExample(code: string): Promise<Observable<any>>{
		const resp =  await this.http.get<any>(this.url + "?code=" + code);
		resp.subscribe(data => {
			console.log(data);
		});
		return resp;
	}
}
