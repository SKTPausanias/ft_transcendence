import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild('msgBox') msgBoxElement: ElementRef;
  @Input() chatPreference: SharedPreferencesI
  
  identifier: string = "";
  //length: number = 0;
  showPrivate: boolean = true;
  showChat: boolean = false;
  channels: any[] = [];
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
    //this.closeChat();
    this.receiver = friend;
    this.friendChat = friend;
    this.showChat = true;
    //delete messages from messages array
    this.messages = [];
    // get messages from DB and save to messages array
    this.messages = await this.chatService.getMessages(this.session, this.receiver);
    //var pepe = this.msgBoxElement.nativeElement.lastElementChild;
    if (this.messages.length)
      this.identifier = this.messages[this.messages.length - 1 ].date.toString();
   
    //msgBox.child[this.messages[this.messages.size - 1]].id == messages.timeStamp scrollDown();
  }
  
  scrollDown(){
    var pepe = document.getElementById(this.identifier);
    console.log('pepeElement: ', pepe );
    pepe?.scrollIntoView();
    
    return (true);
  }
  playPong(friend: any){
    alert("You're gonna dare your friend " + friend.nickname);
  }

  getPrivates(){
    this.showPrivate = true;
    //this.closeChat();
  }

  async getChatGroups(){
    this.showPrivate = false;
    //this.closeChat();
    this.channels = await this.chatService.getChatGroups(this.session);
    console.log("channels: ", this.channels);
  }
  closeChat(){
    this.showChat = false;
  }
}
