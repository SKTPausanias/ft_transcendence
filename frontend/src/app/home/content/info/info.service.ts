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
    try{
		return (this.http.get<any>(url, {headers: new HttpHeaders({
			Authorization: 'Bearer ' + session.token}),
		params : searchParams}));
    }catch(e){
      return (e);
    }
  }
  async addFriendShip(user: any, session: SessionI): Promise<any> {
      const url = '/api/users/chat/addFriend';

      try{
        return (await this.http.post<any>(url, user, { headers: new HttpHeaders({
            Authorization: 'Bearer ' + session.token
          })
        }).toPromise())
      } catch(e){
        return (e);
      }
  }

  async removeFriendShip(user: any, session: SessionI): Promise<any> {
    const url = '/api/users/chat/removeFriend';

    try{
      return (await this.http.post<any>(url, user, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise())
    } catch(e){
      return (e);
    }
  }
}
