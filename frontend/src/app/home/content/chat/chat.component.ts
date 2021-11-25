import { AfterViewInit, Component, ElementRef, Input, OnInit, Type, ViewChild } from '@angular/core';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { SocketService } from '../../socket.service';
import { ChatRoomI, SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { mDate } from 'src/app/utils/date';
import { ChatService } from './chat.service';
import { eChat } from 'src/app/shared/ft_enums';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChatModalComponent } from './chat-modal/chat-modal.component';

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
	showRoom = false;
	channels: any[] = [];
	messages: any[] = [];
	session = this.sQuery.getSessionToken();
	friends: UserPublicInfoI[] = [];
	subscription: any;
	prefSubscription: any;
	constructor(
		private sQuery: SessionStorageQueryService,
		private chatService: ChatService,
		private modalService: NgbModal
	){
	}
  
  async ngOnInit(){
	this.subscription = this.chatService.chatEmiter.subscribe((data : any)=> {
		if (data.action == 'open')
			this.selectChatRoom(data.room);
		else if (data.action == 'onDestroy')
			this.closeRoom();
		else
			this.chatService.chatFragmentEmmiter.emit(data);
	});
	this.chatService.emit(eChat.ON_LOAD_ACTIVE_ROOMS);
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
	console.log("chat room: ", item);
	this.chatPreference.chat.active_room = item;
	this.showRoom = true;
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
  isMemberOnline(room: ChatRoomI){
	return (room.onlineStatus);
  }
  closeRoom(){
	  this.showRoom = false;
  }
  addMemberToChat(){
	this.openModal("member");
	console.log("lets add member")
  }
  openModal(name: string){
	const modal = this.modalService.open(ChatModalComponent, { centered: false, animation: true });
	modal.componentInstance.type = name;
	modal.componentInstance.preferences = this.chatPreference;
	modal.componentInstance.passEntry.subscribe((receivedEntry: any) => {
		console.log(receivedEntry);
	})

  }
}