import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SessionI } from 'src/app/shared/ft_interfaces';
@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) { }
  async searchUsers(session: SessionI, val: string): Promise<any> {
    const url = '/api/users/chat/search';
    var searchParams = new HttpParams().set('match', val);
    console.log(searchParams.get('match'));
    try{
		return (await this.http.get<any>(url, {headers: new HttpHeaders({
			Authorization: 'Bearer ' + session.token}),
		params : searchParams}).toPromise());
    }catch(e){
      return (e);
    }
  }
  liveSearchUsers(session: SessionI, val: string): any {
    const url = '/api/users/chat/search';
    var searchParams = new HttpParams().set('match', val);
    console.log(searchParams.get('match'));
    try{
		return (this.http.get<any>(url, {headers: new HttpHeaders({
			Authorization: 'Bearer ' + session.token}),
		params : searchParams}));
    }catch(e){
      return (e);
    }
  }
}
