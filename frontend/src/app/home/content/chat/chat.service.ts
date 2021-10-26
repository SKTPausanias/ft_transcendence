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
    const url = '/api/users/chat/saveMessage';
    try{
      const ret = (await this.http.post<any>(url, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise());

      this.socketService.emit(wSocket.CHAT_MESSAGE, {
        message: message,
        reciever: reciever});
      return (ret);
    }
    catch(e){
      return (e);
    }
  }
}
