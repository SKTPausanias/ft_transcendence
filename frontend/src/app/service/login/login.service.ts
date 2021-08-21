import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { AppComponent } from '../../app.component'


@Injectable({
  providedIn: 'root'
})
export class LoginService {

	constructor(private http:HttpClient, private appComponent: AppComponent) { }
	url: string = '/api/login';
	
	async getExample(code: string): Promise<Observable<any>>{
		const userData = await this.http.get<any>(this.url + "?code=" + code).toPromise();
		this.appComponent.setUser(userData);
		return (userData);
	}
}
