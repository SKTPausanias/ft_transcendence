import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SessionI } from 'src/app/shared/ft_interfaces';
import { SocketService } from '../../socket.service';
import { wSocket } from 'src/app/shared/ft_enums';

@Injectable({
  providedIn: 'root'
})

export class ChatService {
  constructor(
    private http: HttpClient,
		private socketService: SocketService) { }
  
  async sendMessage(message: string, session: SessionI, reciever: string) {
    /*const url = '/api/users/chat/sendMessage';
    try{
      const ret = (await this.http.post<any>(url, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise())
    }
    catch(e){
      return (e);
    }*/
    this.socketService.emit(wSocket.CHAT_MESSAGE, {
      message: message,
      reciever: reciever});
    /*this.socketService.emit(wSocket.USER_DELETE, {
      emiter : this.settingsPreference.userInfo.login,
      friends : this.settingsPreference.friends});*/
  }
}
