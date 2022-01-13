import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SessionI } from 'src/app/shared/ft_interfaces';
import { SocketService } from '../../socket.service';
import { wSocket } from 'src/app/shared/ft_enums';
import { ChannelI, messageI, MessagesI } from 'src/app/shared/interface/iChat';
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
  
  async sendGroupMessage(message: string, session: SessionI, channel: any, timestamp: number, nickname: string): Promise<any> {
    const url = '/api/users/chat/saveGroupMessage';
    console.log("Calling backend saveGroupMessage...", session);
    var objMessage = new Messages();
    objMessage.setMessage({ message: message, date: timestamp, owner: nickname })
    var body: messageI = <messageI>{};

    body.message = message;
    body.receiver = channel;
    console.log("Channellol: ", body.receiver);
    body.timestamp = timestamp;
    try{
      const ret = (await this.http.post<any>(url, body, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise());
      console.log("Message from chat: ", ret);
      this.socketService.emit(wSocket.CHAT_GROUP_MESSAGE, {
        message: objMessage,
        channel: channel});
        return (ret);
      }
      catch(e){
      console.log("Message error...");
      return (e);
    }
  }

  async getMessages(session: SessionI, receiver: UserPublicInfoI): Promise<any> {
    const url = '/api/users/chat/getMessages';
    var body = { receiver: receiver.nickname };
    var messages: Messages[] = [];
    

    try{
      const ret = (await this.http.post<any>(url, body, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise());
        if (ret.statusCode == 200){
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

  async getGroupMessages(session: SessionI, channel : any) : Promise<any> {
    const url = '/api/users/chat/getGroupMessages';
    var body = { channel: channel };
    var messages: Messages[] = [];

    try{
      const ret = (await this.http.post<any>(url, body, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise());
        if (ret.statusCode == 200){
          console.log("Messages from group chat ret: ", ret.data);
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

  async getChatGroups(session: SessionI): Promise<any> {
    const url = '/api/users/chat/getChatGroups';
    var channels: any[] = [];
    try{
      const ret = (await this.http.get<any>(url, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise());
        if (ret.statusCode == 200){
          channels = ret.data.chats;
        }
        return (channels);
      }
      catch(e){
        console.log("Message error...");
        return (e);
    }
  }

  async getOwnChannels(session: SessionI): Promise<any>{
    const url = '/api/users/chat/getOwnChannels';
    var channels: any[] = [];
    try{
      const ret = (await this.http.get<any>(url, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise());
        if (ret.statusCode == 200){
          channels = ret.data.chats;
        }
        return (channels);
      }
      catch(e){
        console.log("Message error...");
        return (e);
    }
  }

  async getChatUsers(session: SessionI, chatInfo: ChannelI): Promise<any>{
    const url = '/api/users/chat/getChatUsers';
    try{
      return (await this.http.post<any>(url, chatInfo, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise());
      }
      catch(e){
        console.log("Message error...");
        return (e);
    }
  }

  async blockUser(session: SessionI, members: UserPublicInfoI[], friendIsBlocked: boolean): Promise<any>{
    const url = '/api/users/chat/blockUser';
    try{
      const ret = (await this.http.post<any>(url, {'members': members, 'isBlocked': friendIsBlocked}, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise());
      this.socketService.emit(wSocket.CHAT_BLOCK_USER, {
        members: members,
        isBlocked: friendIsBlocked});
      return (ret);
      }
      catch(e){
        console.log("Message error...");
        return (e);
    }
  }

  async iAmBlocked(session: SessionI, friend: UserPublicInfoI): Promise<any>{
    const url = '/api/users/chat/iAmBlocked';
    try{
      const ret = (await this.http.post<any>(url, {'friend': friend}, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise());
      return (ret.data.blocked);
      }
      catch(e){
        console.log("Message error...");
        return (e);
    }
  }

  async friendIsBlocked(session: SessionI, friend: UserPublicInfoI): Promise<any>{
    const url = '/api/users/chat/friendIsBlocked';
    try{
      return (await this.http.post<any>(url, {'friend': friend}, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise());
      }
      catch(e){
        console.log("Message error...");
        return (e);
    }
  }

  async imNotBlocked(session: SessionI, friend: UserPublicInfoI): Promise<any>{
    const url = '/api/users/chat/imNotBlocked';
    try{
      return (await this.http.post<any>(url, {'friend': friend}, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise());
      }
      catch(e){
        console.log("Message error...");
        return (e);
    }
  }

  async isMuted(session: SessionI, channel: any): Promise<any>{
    const url = '/api/users/chat/isMuted';
    try{
      const ret = (await this.http.post<any>(url, {'channel': channel}, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise());
      console.log("isMuted ret: ", ret);
      return (ret.data.muted);
    }
      catch(e){
        console.log("Message error...");
        return (e);
    } 
}

  async muteUserGroup(session: SessionI, channel: any, user: UserPublicInfoI): Promise<any> {
    const url = '/api/users/chat/muteUserGroup';
    try{
      const ret = (await this.http.post<any>(url, {'channel': channel, 'user': user}, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise());
      this.socketService.emit(wSocket.CHAT_MUTE_USER, {
        channel: channel,
        user: user});
      return (ret);
      }
    catch(e){
      console.log("Message error...");
      return (e);
    }
  }
}