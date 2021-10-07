import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionI } from 'src/app/shared/ft_interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  async login(login: string, password: string){
	  const url = '/api/login'
	  const body = {login, password}
	  const response = await this.http.post<any>(url, body).toPromise();
	  return (response);
  }
  async signUp(usrData: any){
		const url = '/api/signUp';
		const response = await this.http.post<any>(url, usrData).toPromise();
		return (response);
  }
  async confirm(code:any)
  {
	  const url = '/api/confirmation';
	  const response = await this.http.post<any>(url, code).toPromise();
	  return (response)
  }
  async resendConfirmationEmail(email: string)
  {
	  const url = '/api/confirmation/resend';
	  const response = await this.http.post<any>(url, {email : email}).toPromise();
	  return (response);
  }
  async ftLogin(code: string)
  {
	const url = '/api/ftLogin';
	const response = await this.http.post<any>(url, {code : code}).toPromise();
	return (response);
  }
  async ftSignUp(code: string)
  {
	const url = '/api/ftSignUp';
	const response = await this.http.post<any>(url, {code : code}).toPromise();
	return (response);
  }
  async generate(email: string)
  {
	const url = '/api/code/generate';
	const response = await this.http.post<any>(url, {email : email}).toPromise();
	return (response);
  }
  async validate(code: number, email : string)
  {
	const url = '/api/code/validate';
	const response = await this.http.post<any>(url, {code : code, email : email}).toPromise();
	return (response);
  }
  

  async logout(session: SessionI)
  {
	const url = '/api/logout';
	const response = await this.http.delete(url, { headers: new HttpHeaders({
		Authorization: 'Bearer ' + session.token})}).toPromise();
	return (response);

  }
  //SHOULD CREATE ANOTHER SERVICE CLASS FOR NEXT FUNCTIONS

  
}
