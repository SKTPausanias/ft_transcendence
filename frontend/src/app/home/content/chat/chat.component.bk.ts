import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { ChatService } from './chat.service';
import { SocketService } from '../../socket.service';
import { SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { mDate } from 'src/app/utils/date';
import { Messages } from 'src/app/shared/class/cMessages';
import { ChannelI } from 'src/app/shared/interface/iChat';

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
  showGroupChat: boolean = false;
  friendIsBlocked: boolean = false;
  imBlocked: boolean = false;
  channels: any[] = [];
  channel: any;
  messages: Messages[] = [];
  //must retrieve messages from message DB to this array {message, from<userInfo>{}, to<userInfo>{}, timestamp}
  message = "";
  recievedMessage = "";
	session = this.sQuery.getSessionToken();
  receiver : UserPublicInfoI = <UserPublicInfoI>{};
  friendChat: UserPublicInfoI = <UserPublicInfoI>{};

  //TMP CHANNELS & DIRECT MESSAGES
  
  channs: String[] = ["random-chanel", "info", "tornoments","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff"]
  directMsg: String[] = ["Juan", "Pepe", "Paco","Fran" ]
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
    this.socketService.chatBlockFilter.subscribe(
      (data : any) => {
        if (data != undefined) {
          console.log("data from subscribe: ", data);
          if (data == false)
            this.imBlocked = true;
          else
            this.imBlocked = false;
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

  async sendGroupMessage() {
    this.message = this.message.trim();
    if (this.message.length) {
      await this.chatService.sendGroupMessage(this.message, this.session, this.channel, mDate.timeNowInSec(), this.chatPreference.userInfo.nickname);
      this.message = "";
    }
  }

  async selectChat(friend: any) {
    //this.closeChat();
    this.receiver = friend;
    this.friendChat = friend;
    this.showChat = true;
    this.showGroupChat = false;
    //delete messages from messages array
    this.messages = [];
    ////var ret = await this.chatService.friendIsBlocked(this.session, this.friendChat); ??
    ////this.friendIsBlocked = ret.data.blocked; ??
    console.log("friendIsBlocked: ", this.friendIsBlocked);

    ////await this.chatService.imNotBlocked(this.session, this.friendChat)
    //access blocked status
    if (this.friendIsBlocked == false && this.imBlocked == false)
      this.messages = await this.chatService.getMessages(this.session, this.receiver);
    //var pepe = this.msgBoxElement.nativeElement.lastElementChild;
    if (this.messages.length)
      this.identifier = this.messages[this.messages.length - 1 ].date.toString();
   
	 
    //msgBox.child[this.messages[this.messages.size - 1]].id == messages.timeStamp scrollDown();
  }

  async selectChatGroup(channel: any){
    console.log("channel: ", channel);
    this.showGroupChat = true;
    this.showChat = false;
    //this.receiver = channel;
    this.channel = channel;
    this.messages = [];
    this.messages = await this.chatService.getGroupMessages(this.session, this.channel);
    if (this.messages.length)
      this.identifier = this.messages[this.messages.length - 1 ].date.toString();
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
  
  async blockUser(friend: any): Promise<void>{
    var members: UserPublicInfoI[] = [];
    this.messages = [];
    members.push(this.chatPreference.userInfo);
    members.push(this.friendChat);
    await this.chatService.blockUser(this.session, members, this.friendIsBlocked);
    if (this.friendIsBlocked == true)
    {
      this.friendIsBlocked = false;
      this.messages = await this.chatService.getMessages(this.session, this.receiver);
    }
    else
      this.friendIsBlocked = true;
  }

  closeChat(){
    this.showChat = false;
  }
}
