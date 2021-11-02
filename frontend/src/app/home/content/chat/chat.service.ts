import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SessionI } from 'src/app/shared/ft_interfaces';
import { SocketService } from '../../socket.service';
import { wSocket } from 'src/app/shared/ft_enums';
import { messageI, MessagesI } from 'src/app/shared/interface/iChat';
import { Messages } from 'src/app/shared/class/cMessages';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(
    private http: HttpClient,
		private socketService: SocketService,
    ) { }
  
  async sendMessage(message: string, session: SessionI, receiver: UserPublicInfoI, timestamp: number, nickname: string): Promise<any> {
    const url = '/api/users/chat/saveMessage';
    console.log("Calling backend saveMessage...", session);
    var objMessage = new Messages();
    objMessage.setMessage({ message: message, date: timestamp, user : receiver, owner: nickname })
    var body: messageI = <messageI>{};

    body.message = message;
    body.receiver = receiver.nickname;
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
        message: objMessage,
        receiver: receiver.nickname});
        return (ret);
      }
      catch(e){
      console.log("Message error...");
      return (e);
    }
  }

  async getMessages(session: SessionI, receiver: UserPublicInfoI): Promise<any> {
    const url = '/api/users/chat/getMessages';
    //console.log("Calling backend getMessages...", session);
    var body = { receiver: receiver.nickname };
    var messages: Messages[] = [];
    

    try{
      const ret = (await this.http.post<any>(url, body, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise());
        if (ret.statusCode == 200){
          //messages = new Messages(ret.data.messages);
          console.log("Messages from chat ret: ", ret.data);
          //aux = ret.data.messages;
          // for each message in ret.data.messages, create a new Messages object and push it into messages array
          //convert aux
          for (let i = 0; i < ret.data.messages.length; i++)
          {
            var tmp: Messages = new Messages();
            tmp.setMessage({ message: ret.data.messages[i].message, date: ret.data.messages[i].date, user : ret.data.messages[i].user, owner: ret.data.messages[i].user.nickname });
            messages.push(tmp);
          }
          console.log("Messages from chat on var messages: ", messages);
        }
        return (messages);
      }
      catch(e){
        console.log("Message error...");
        return (e);
    }
  }
}
