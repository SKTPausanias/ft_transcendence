import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SessionI } from 'src/app/shared/ft_interfaces';
@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) { }
  async getPeople(session: SessionI, val: any): Promise<any> {
    const url = '/api/chat/findPeople';
    try{
      return (await this.http.post<any>(url, {
        myParams: new HttpParams().set('text', val),
        httpHeaders: new HttpHeaders({
            Authorization: 'Bearer ' + session.token
          })
        }).toPromise());
    }catch(e){
      return (e);
    }
  }
}
