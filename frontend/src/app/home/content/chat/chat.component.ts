import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { SocketService } from '../../socket.service';
import { ChatRoomI, SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { mDate } from 'src/app/utils/date';
import { ChatService } from './chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
	@Input() chatPreference: SharedPreferencesI;
	privateRooms: ChatRoomI[] = [];
	groupRooms: ChatRoomI[] = [];
	showChannels: boolean = true;
	showDM : boolean = true;
	showMsgFragment = false;
	channels: any[] = [];
	messages: any[] = [];
	session = this.sQuery.getSessionToken();
	friends: UserPublicInfoI[] = [];
	subscription: any;
	prefSubscription: any;
	constructor(
		private sQuery: SessionStorageQueryService,
		private socketService: SocketService,
		private chatService: ChatService
	){
	}
  
  async ngOnInit(){
	this.subscription = this.socketService.chatEmiter.subscribe((data : any)=> {
		if (data.action == 'open')
			this.selectChatRoom(data.room);
		else
			this.chatService.chatFragmentEmmiter.emit(data);
	});
	/* this.prefSubscription = this.chatService.prefEmiter.subscribe((data =>{
		this.chatPreference.chat = data;
	})) */
	if (this.chatPreference.chat.active_room != undefined)
		this.selectChatRoom(this.chatPreference.chat.active_room);
  }
  ngOnDestroy() {
	this.subscription.unsubscribe();
	//this.prefSubscription.unsubscribe();
  }
  hideShowChannels(){
	this.showChannels ? (this.showChannels = false) : (this.showChannels = true);
  }
  hideShowDM(){
	this.showDM ? (this.showDM = false) : (this.showDM = true);
  }
  selectChatRoom(item: any){
	this.chatPreference.chat.active_room = item;
	this.showMsgFragment = true;
	this.chatService.chatFragmentEmmiter.emit({action : "room-change"});
  }

  getPrivateRooms(){
	return (this.chatPreference.chat.rooms.filter(room => room.img != undefined))
  }
  getGroupRooms(){
	return (this.chatPreference.chat.rooms.filter(room => room.img == undefined))
  }
  isSelected(room: ChatRoomI)
  {
	return (this.chatPreference.chat.active_room != undefined && room.id == this.chatPreference.chat.active_room.id)
  }
}