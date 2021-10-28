import { Component, Input, OnInit } from '@angular/core';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { ChatService } from './chat.service';
import { SocketService } from '../../socket.service';
import { SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { UserService } from 'src/app/shared/ft_services';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { messageI } from 'src/app/shared/interface/iChat';
import { mDate } from 'src/app/utils/date';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @Input() chatPreference: SharedPreferencesI
  messages: messageI[] = <messageI[]>{};//must retrieve messages from message DB to this array {message, from<userInfo>{}, to<userInfo>{}, timestamp}
  message = "";
  recievedMessage = "";
	session = this.sQuery.getSessionToken();
  receiver = "";
  friendChat: UserPublicInfoI = <UserPublicInfoI>{};
  

	constructor(
    private chatService: ChatService,
    private sQuery: SessionStorageQueryService,
    private socketService: SocketService,
  ){}
  
  ngOnInit(){
    this.socketService.chatFilter.subscribe(
      (data : any) => {
        if (data) {
          console.log("data from subscribe: ", data);
          this.recievedMessage = data;
          const element = document.createElement('li');
          element.innerHTML = this.recievedMessage;
          element.style.background = 'white';
          element.style.padding = '10px 25px';
          element.style.margin = '10px';
          document.getElementById('message-list')?.appendChild(element)
        }
      }
    );
	}

  async sendMessage() {
    this.message = this.message.trim();
    console.log("mensaje: ", this.message);
    if (this.message.length) {
      await this.chatService.sendMessage(this.message, this.session, this.receiver, mDate.timeNowInSec());
      mDate.timeNowInSec()
      /*const element = document.createElement('li');
      element.innerHTML = this.message;
      element.style.background = '#C3FDB8';
      element.style.padding = '10px 25px';
      element.style.margin = '10px';
      document.getElementById('message-list')?.appendChild(element);*/
      this.message = "";
    }
  }

  async selectChat(friend: any) {
    this.receiver = friend.nickname;
    this.friendChat = friend;
    console.log("friends: ", this.chatPreference.friends);
    console.log("selected friend", this.receiver);
  }
}
