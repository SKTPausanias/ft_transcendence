import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { UserI } from 'src/app/shared/interface/user';
import * as enums from 'src/app/shared/enums/eUser'
import * as uuid from 'uuid';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

	user: UserI = <UserI>{};
	constructor(private http:HttpClient) { }
	async getUserData(code: string): Promise<UserI>{ // TODO <uncomment when data is comming from backend> Promise<Observable<any>>{
		const url = '/api/login';
		const data =  (await this.http.get<any>(url + "?code=" + code).toPromise());
		return data;
	}
	async registerUser(userData: UserI): Promise<UserI>
	{
		const url = '/api/user/registration';
		this.user = await this.http.post<any>(url, userData).toPromise();
		return (this.user);
	}
	async updateUser(userData: UserI): Promise<UserI>
	{
		const url = '/api/user/confirmation';
		this.user = await this.http.post<any>(url, userData).toPromise();
		return(this.user);
	}
	createUser(userData: any){
		this.user.id = userData.id;
		this.user.first_name = userData.first_name;
		this.user.last_name = userData.last_name;
		this.user.nickname = userData.login;
		this.user.login = "saanpedro";
		this.user.email = userData.email;
		this.user.role = enums.UserRole.ADMIN;
	/* 	this.user.token = uuid.v4();
		this.user.token_creation_time = Date.now();
		this.user.token_expires = this.user.token_creation_time + (10 * 1000); */
		//This is manual usage actualy need data from backend
		this.user.status = enums.UserStatus.UNREGISTERED;
	}
}