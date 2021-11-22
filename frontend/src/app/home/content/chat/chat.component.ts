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
  showMembers: boolean = false;
  members: UserPublicInfoI[] = [];
  channels: any[] = [];
  channel: any;
  messages: Messages[] = [];
  //must retrieve messages from message DB to this array {message, from<userInfo>{}, to<userInfo>{}, timestamp}
  message = "";
  recievedMessage = "";
	session = this.sQuery.getSessionToken();
  receiver : UserPublicInfoI = <UserPublicInfoI>{};
  friendChat: UserPublicInfoI = <UserPublicInfoI>{};
  //create dictionary with nicknames as keys and one value that is a boolean
  chatsBlocked: {[key: string]: boolean} = {};

	constructor(
    private chatService: ChatService,
    private sQuery: SessionStorageQueryService,
    private socketService: SocketService,
  ){}
  
  ngOnInit(){
    //for friend in chatPreference.friends fill chatsBlocked with false
    this.chatPreference.friends.forEach(friend => {
      this.chatsBlocked[friend.nickname] = false;
    });
    console.log("chatsBlocked: ", this.chatsBlocked);
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
          if (data.isBlocked == false)
            this.chatsBlocked[data.members[0].nickname] = true;
          else
            this.chatsBlocked[data.members[0].nickname] = false;
          /*if (data.isBlocked == false)
            this.imBlocked = true;
          else
            this.imBlocked = false;*/
        }
      }
    );
    this.socketService.chatMuteFilter.subscribe(
      (data : any) => {
        if (data) {
          console.log("data from subscribe: ", data);

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
    this.chatsBlocked[this.friendChat.nickname] = await this.chatService.iAmBlocked(this.session, this.receiver);
    console.log("imBlocked: ", this.imBlocked);
    if (this.chatsBlocked[this.friendChat.nickname] == false)
    {
      //delete messages from messages array
      this.messages = [];
      this.messages = await this.chatService.getMessages(this.session, this.receiver);
    //var pepe = this.msgBoxElement.nativeElement.lastElementChild;
      if (this.messages.length)
        this.identifier = this.messages[this.messages.length - 1 ].date.toString();
    }
    //msgBox.child[this.messages[this.messages.size - 1]].id == messages.timeStamp scrollDown();
  }

  async selectChatGroup(channel: any){
    console.log("channel: ", channel);
    this.showGroupChat = true;
    this.showChat = false;
    //this.receiver = channel;
    this.channel = channel;
    this.messages = [];
    //if ((await this.chatService.isMuted(this.session, this.channel)) == false) // banned not muted
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

  async listMembers()
  {
    if (this.showMembers)
      this.showMembers = false;
    else
      this.showMembers = true;
    const ret = await this.chatService.getChatUsers(this.session, this.channel);
    this.members = ret.data.users;
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

  async muteUserGroup(user : UserPublicInfoI) {
    console.log("user: ", user);
    const ret = await this.chatService.muteUserGroup(this.session, this.channel, user);
    console.log("ret: ", ret);
  }

  async banUserGroup(user : UserPublicInfoI) {
    //const ret = await this.chatService.banUserGroup(this.session, this.channel, user);
  }

  closeChat(){
    this.showChat = false;
  }
}
