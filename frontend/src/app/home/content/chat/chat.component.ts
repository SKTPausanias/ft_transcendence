import { Component, Input, OnInit } from '@angular/core';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { ChatService } from './chat.service';
import { SocketService } from '../../socket.service';
import { SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { mDate } from 'src/app/utils/date';
import { Messages } from 'src/app/shared/class/cMessages';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @Input() chatPreference: SharedPreferencesI
  messages: Messages[] = [];
  //must retrieve messages from message DB to this array {message, from<userInfo>{}, to<userInfo>{}, timestamp}
  message = "";
  recievedMessage = "";
	session = this.sQuery.getSessionToken();
  receiver : UserPublicInfoI = <UserPublicInfoI>{};
  friendChat: UserPublicInfoI = <UserPublicInfoI>{};
  msgTime: string = new Date(1635433636000).toLocaleString();
  

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
          this.messages.push(data);
        }
      }
    );
	}

  async sendMessage() {
    this.message = this.message.trim();
    if (this.message.length) {
      await this.chatService.sendMessage(this.message, this.session, this.receiver, mDate.timeNowInSec(), this.chatPreference.userInfo.nickname);
      this.message = "";
    }
  }

  async selectChat(friend: any) {
    this.receiver = friend;
    this.friendChat = friend;
    //delete messages from messages array
    this.messages = [];
    // get messages from DB and save to messages array
    this.messages = await this.chatService.getMessages(this.session, this.receiver);
  }
  
}
