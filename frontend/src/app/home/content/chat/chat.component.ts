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
	@Input() chatPreference: SharedPreferencesI;
	showChannels: boolean = true;
	showDM : boolean = true;
	showMsgFragment = false;
	imBlocked: boolean = false;
	isChannel: boolean | undefined = undefined;
	identifier: any;
	channs: String[] = ["random-chanel", "info", "tournoments","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff"]
	directMsg: String[] = ["Juan", "Pepe", "Paco","Fran" ];
	channels: any[] = [];
	messages: Messages[] = [];
	session = this.sQuery.getSessionToken();
	friends: UserPublicInfoI[] = [];
	constructor(private chatService: ChatService,
		private sQuery: SessionStorageQueryService,
		private socketService: SocketService
	){
	}
  
  async ngOnInit(){
	  console.log(this.chatPreference)
	  this.friends = this.chatPreference.friends;

	this.channels = await this.chatService.getChatGroups(this.session);
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

  hideShowChannels(){
	this.showChannels ? (this.showChannels = false) : (this.showChannels = true);
  }
  hideShowDM(){
	this.showDM ? (this.showDM = false) : (this.showDM = true);
  }
  async selectChatRoom(item: any, isChannel: boolean){
	if (isChannel)
		this.messages = await this.chatService.getGroupMessages(this.session, item);
	else
		this.messages = await this.chatService.getMessages(this.session, item);

	this.identifier = item;
	this.showMsgFragment = true;
	this.isChannel = isChannel;
  }
}