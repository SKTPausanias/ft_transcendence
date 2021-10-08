import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SessionI } from 'src/app/shared/ft_interfaces';
@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) { }
  async getPeople(session: SessionI, val: any): Promise<any> {
    const url = '/api/users/chat/findPeople';
    var myParams = new HttpParams().set('text', val);
    console.log(myParams.get('text'));
    try{
      return (await this.http.post<any>(url, myParams, {headers: new HttpHeaders({
				Authorization: 'Bearer ' + session.token})}).toPromise());
    }catch(e){
      return (e);
    }
  }
}
