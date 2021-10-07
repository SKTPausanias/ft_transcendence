import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionI } from 'src/app/shared/ft_interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserService {

	constructor(private http: HttpClient) { }
  async getOnlineUsers(session: SessionI)
  {
	const url = '/api/users/online';
	const response = await this.http.get<any>(url,{ headers : new HttpHeaders({
		Authorization: 'Bearer ' + session.token})}).toPromise();
	return (response);
  }
  async getUserInfo(session: SessionI)
  {
	const url = '/api/users/userInfo';
	const response = await this.http.get<any>(url,{ headers : new HttpHeaders({
		Authorization: 'Bearer ' + session.token})}).toPromise();
	return (response);
  }
}
