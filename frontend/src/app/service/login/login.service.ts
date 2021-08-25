import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { AppComponent } from '../../app.component'
import { UserI } from '../../model/interface/user'
import { UserRole } from '../../model/enums/roles'
import { UserStatus } from '../../model/enums/userStatus'
import * as uuid from 'uuid';



@Injectable({
  providedIn: 'root'
})
export class LoginService {

	user: UserI = <UserI>{};
	constructor(private http:HttpClient, private appComponent: AppComponent) { }
	
	async getUserData(code: string): Promise<UserI>{ // TODO <uncomment when data is comming from backend> Promise<Observable<any>>{
		const url = '/api/login';
		const userData = await this.http.get<any>(url + "?code=" + code).toPromise();

		this.tmpFillUser(userData);
		this.appComponent.setUser(this.user);
		return (this.user);
	}
	async registerUser(data: UserI): Promise<UserI>
	{
		const url = '/api/user/registration';
		this.user = await this.http.post<any>(url, data).toPromise();
		console.log(this.user);
		this.appComponent.setUser(this.user);
		return (this.user);
	}
	tmpFillUser(userData: any){
		this.user.id = userData.id;
		this.user.first_name = userData.first_name;
		this.user.last_name = userData.last_name;
		this.user.nickname = userData.login;
		this.user.login = "saanpedro";
		this.user.email = userData.email;
		this.user.role = UserRole.ADMIN;
		this.user.token = uuid.v4();
		this.user.token_creation_time = Date.now();
		this.user.token_expires = this.user.token_creation_time + (10 * 1000);
		//This is manual usage actualy need data from backend
		this.user.status = UserStatus.UNREGISTERED;
	}
}
