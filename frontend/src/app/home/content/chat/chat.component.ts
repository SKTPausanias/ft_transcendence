import { AfterViewInit, Component, ElementRef, Input, OnInit, Type, ViewChild } from '@angular/core';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { SocketService } from '../../socket.service';
import { ChatRoomI, SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { mDate } from 'src/app/utils/date';
import { ChatService } from './chat.service';
import { eChat, eChatType } from 'src/app/shared/ft_enums';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChatModalComponent } from './modal/chat-modal.component';

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"],
})
export class ChatComponent implements OnInit {
  @Input() chatPreference: SharedPreferencesI;
  directRooms: ChatRoomI[] = [];
  privateRooms: ChatRoomI[] = [];
  publicRooms: ChatRoomI[] = [];
  showChannels: boolean = true;
  showPublicChannels: boolean = true;
  showPrivateChannels: boolean = true;
  showDM: boolean = true;
  showRoom = false;
  messages: any[] = [];
  session = this.sQuery.getSessionToken();
  friends: UserPublicInfoI[] = [];
  subscription: any;
  prefSubscription: any;
  constructor(
    private sQuery: SessionStorageQueryService,
    private chatService: ChatService,
    private modalService: NgbModal
  ) {}

  async ngOnInit() {
    this.subscription = this.chatService.chatEmiter.subscribe((data: any) => {
		this.distinguishRooms();
		this.chatService.chatFragmentEmmiter.emit(data);
		if (data == undefined)
			return;
		if (data.room != undefined) 
			this.selectChatRoom(data.room);
		else if (data.onDestroy != undefined) 
			this.closeRoom();
		else if (data.close != undefined)
		{
			console.log("Data.close = ", data.close)
			if (this.chatPreference.chat.active_room != undefined && 
				this.chatPreference.chat.active_room.id == data.close.id && !data.close.owner && data.close.protected)
				this.closeRoom()
		}
    });
    this.chatService.emit(eChat.ON_LOAD_ACTIVE_ROOMS);
    if (this.chatPreference.chat.active_room != undefined)
      this.selectChatRoom(this.chatPreference.chat.active_room);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    //this.prefSubscription.unsubscribe();
  }
  hideShowChannels() {
    this.showChannels
      ? (this.showChannels = false)
      : (this.showChannels = true);
  }
  hideShowPublicChannels() {
    this.showPublicChannels
      ? (this.showPublicChannels = false)
      : (this.showPublicChannels = true);
  }

  hideShowPrivateChannels() {
    this.showPrivateChannels
      ? (this.showPrivateChannels = false)
      : (this.showPrivateChannels = true);
  }
  hideShowDM() {
    this.showDM ? (this.showDM = false) : (this.showDM = true);
  }
  selectChatRoom(item: ChatRoomI) {
	  console.log("chat selected: ", item);
	if (item.protected && !item.owner && !item.hasRoomKey)
		return (this.openModal("protected", item));
	this.chatPreference.chat.active_room = item;
	this.showRoom = true;
	this.chatService.chatFragmentEmmiter.emit({ changeRoom: item });
  }
  distinguishRooms() {
    var rooms = this.chatPreference.chat.rooms;
    this.directRooms = rooms.filter((room) => room.type == eChatType.DIRECT);
    this.privateRooms = rooms.filter((room) => room.type == eChatType.PRIVATE);
    this.publicRooms = rooms.filter((room) => room.type == eChatType.PUBLIC);
  }
  getPrivateRooms() {
    return this.chatPreference.chat.rooms.filter(
      (room) => room.img != undefined
    );
  }
  getGroupRooms() {
    return this.chatPreference.chat.rooms.filter(
      (room) => room.img == undefined
    );
  }
  isSelected(room: ChatRoomI) {
    return (
      this.chatPreference.chat.active_room != undefined &&
      room.id == this.chatPreference.chat.active_room.id
    );
  }
  isMemberOnline(room: ChatRoomI) {
    return room.onlineStatus;
  }
  closeRoom() {
    this.showRoom = false;
  }
  addMemberToChat() {
    this.openModal("member");
  }
  changePassword(){
	  console.log("lets open modal pwd")
	//this.openModal("pwd");
}
  openModal(name: string, room?: ChatRoomI) {
    const modal = this.modalService.open(ChatModalComponent, {
      centered: false,
      animation: true,
    });
    modal.componentInstance.type = name;
    modal.componentInstance.room = room;
    modal.componentInstance.preferences = this.chatPreference;
    modal.componentInstance.passEntry.subscribe((receivedEntry: any) => {
		if (receivedEntry == undefined)
			this.chatService.emit(eChat.ON_LOAD_ACTIVE_ROOMS);
		else if (receivedEntry.room != undefined)
		{
			this.selectChatRoom(receivedEntry.room);

		}
    });
  }
}