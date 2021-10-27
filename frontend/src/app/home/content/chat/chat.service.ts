import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SessionI } from 'src/app/shared/ft_interfaces';
import { SocketService } from '../../socket.service';
import { wSocket } from 'src/app/shared/ft_enums';
import { messageI } from 'src/app/shared/interface/iChat';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private http: HttpClient,
		private socketService: SocketService,
    ) { }
  
  async sendMessage(message: string, session: SessionI, reciever: string): Promise<any> {
    const url = '/api/users/chat/saveMessage';
    console.log("Calling backend saveMessage...", session);
    var body: messageI = <messageI>{};
    body.message = message;
    body.receiver = reciever;
    /* Need to set/pass as argument of this function the following parameters:  
    body.chatID = chatID;
    body.userID = this.user.id;
    * Then we can send to backend as body the data to be saved into message table.
    */

   
    try{
      const ret = (await this.http.post<any>(url, body, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise());
      console.log("Message from chat: ", ret);
      this.socketService.emit(wSocket.CHAT_MESSAGE, {
        message: message,
        reciever: reciever});
        return (ret);
      }
      catch(e){
      console.log("Message error...");
      return (e);
    }
  }
}
