import { Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren, EventEmitter, Output } from "@angular/core";
import { eChat } from "src/app/shared/ft_enums";
import { ChatRoomI, MessagesI, SharedPreferencesI } from "src/app/shared/ft_interfaces";
import { SessionStorageQueryService } from "src/app/shared/ft_services";
import { UserPublicInfoI } from "src/app/shared/interface/iUserInfo";
import { DashboardService } from "../../dashboard/dashboard.service";
import { ChatService } from "../chat.service";

@Component({
  selector: "app-messaging",
  templateUrl: "./messaging.component.html",
  styleUrls: ["./messaging.component.css"],
})
export class MessagingComponent implements OnInit {
	@Input() msgPreference: SharedPreferencesI;
	@Output() closeRoomEvent = new EventEmitter<any>();
	@Output() addMemberEvent = new EventEmitter<any>();
	@ViewChild('scrollframe', {static: false}) scrollFrame: ElementRef;
	@ViewChildren('scroolMsg') itemElements: QueryList<any>;
	private scrollContainer: any;

	msg: string = '';
	session = this.sQuery.getSessionToken();
	name: string = '';
	messages: MessagesI[] = [];
	members: UserPublicInfoI[];
	room: ChatRoomI;
	subscription: any;
	imBanned: boolean = false;
	imMuted: boolean = false;
	directBanned: boolean = false;

	constructor(
		private sQuery: SessionStorageQueryService,
		private chatService: ChatService,
		private dashboardService: DashboardService
	) {}

	async ngOnInit(): Promise<void> {
		this.subscription = this.chatService.chatFragmentEmmiter.subscribe((data : any)=> {
			this.chatFragmentEmitterHandler(data);
		});
		this.room = this.msgPreference.chat.active_room;
		this.members =  this.room.members;
		this.chatService.emit(eChat.ON_All_MSG, {room: this.room});
		

	}
	ngAfterViewInit() {
		this.scrollContainer = this.scrollFrame.nativeElement;
		this.itemElements.changes.subscribe(_ => this.onItemElementsChanged());
		this.scrollToBottom();
	}
	ngOnDestroy() {
		this.subscription.unsubscribe();
	  }
	async send(){
		this.msg = this.msg.trim();
		if (this.msg.length <= 0 )
			return ;
		this.room = this.msgPreference.chat.active_room;
		this.chatService.emit(eChat.ON_NEW_MSG, {room: this.room, msg: this.msg});
		this.msg = '';
	}
	private onItemElementsChanged(): void {
		this.scrollToBottom();
	}
	private scrollToBottom(): void {
		this.scrollContainer.scroll({
		  top: this.scrollContainer.scrollHeight,
		  left: 0
		});
	}
	private chatFragmentEmitterHandler(data: any)
	{
		if (data == undefined)
			return this.setupRoom();
		if (data.action == 'room-change')
			this.onRoomChange();
		else if (data.action == 'loadAllMsg')
		{
			this.messages = data.messages;
		}
		else if (data.action == 'newMsg')
		{
			if (data.messages.chatId == this.room.id)
				this.messages.push(data.messages);
		}
	}
	private onRoomChange(){
		this.room = this.msgPreference.chat.active_room;
		this.chatService.emit(eChat.ON_All_MSG, {room: this.room});
	}
	showMembers(){
		console.log(this.room.members);
	}
	closeRoom(){
		this.closeRoomEvent.emit();
	}
	addMemberToChat(){
		this.addMemberEvent.emit()
	}
	leaveChat(){
		this.chatService.emit(eChat.ON_LEAVE_ROOM, this.room);
		this.closeRoom();
	}
	blockUser(item: UserPublicInfoI){
		this.chatService.emit(eChat.ON_BLOCK_USER, {user: item, room: this.room});
		console.log(item);
	}
	muteUser(item: UserPublicInfoI){		
		this.chatService.emit(eChat.ON_MUTE_USER, {user: item, room: this.room});
		console.log("lets mute this user: ", item.nickname);
	}
	isPrivateRoom(){
		return (this.msgPreference.chat.active_room.img != undefined);
	}
	getImage(){
		return (this.msgPreference.chat.active_room.img);
	}

	async addFriendShip(user: UserPublicInfoI){
		const resp = await (this.dashboardService.addFriendShip(user, this.session));
	}

	setupRoom(){
		this.imBanned = false;
		this.imMuted = false;
		this.directBanned = false;
		this.room = this.msgPreference.chat.active_room;
		if (this.room.banned.length > 0)
			this.imBanned = this.room.banned.find(item => item.login == this.room.me.login) != undefined;
		if (this.room.muted.length > 0)
			this.imMuted = this.room.muted.find(item => item.login == this.room.me.login) != undefined;
		if (this.room.members.length == 1 && this.room.banned.length)
		{
			this.directBanned = true;
			this.scrollToBottom();
		}
		console.log(this.directBanned);
	}
}
