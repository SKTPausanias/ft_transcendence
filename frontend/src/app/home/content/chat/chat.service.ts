import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SessionI } from 'src/app/shared/ft_interfaces';
import { SocketService } from '../../socket.service';
import { wSocket } from 'src/app/shared/ft_enums';
import { messageI, MessagesI } from 'src/app/shared/interface/iChat';
import { Messages } from 'src/app/shared/class/cMessages';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private http: HttpClient,
		private socketService: SocketService,
    ) { }
  
  async sendMessage(message: string, session: SessionI, receiver: string, timestamp: number): Promise<any> {
    const url = '/api/users/chat/saveMessage';
    console.log("Calling backend saveMessage...", session);
    var body: messageI = <messageI>{};
    body.message = message;
    body.receiver = receiver;
    body.timestamp = timestamp;
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
        receiver: receiver});
        return (ret);
      }
      catch(e){
      console.log("Message error...");
      return (e);
    }
  }

  async getMessages(session: SessionI, receiver: string): Promise<any> {
    const url = '/api/users/chat/getMessages';
    console.log("Calling backend getMessages...", session);
    var body = { receiver: receiver };
    var messages:Messages;

    try{
      const ret = (await this.http.post<any>(url, body, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise());
        if (ret.statusCode == 200){
          messages = new Messages(ret.data.messages[0]);
          console.log("Message from chat Interface: ", messages);
        }
        return (ret.data.messages);
      }
      catch(e){
        console.log("Message error...");
        return (e);
    }
  }
}
