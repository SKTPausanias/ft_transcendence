import { Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren, EventEmitter, Output, HostListener } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { eChat } from "src/app/shared/ft_enums";
import { ChatRoomI, MessagesI, SharedPreferencesI } from "src/app/shared/ft_interfaces";
import { SessionStorageQueryService } from "src/app/shared/ft_services";
import { UserPublicInfoI } from "src/app/shared/interface/iUserInfo";
import { DashboardService } from "../../dashboard/dashboard.service";
import { ChatService } from "../chat.service";
import { ChangePasswordComponent } from "../modal/change-password/change-password.component";
import { UserProfileComponent } from "../modal/user-profile/user-profile.component";

@Component({
  selector: "app-messaging",
  templateUrl: "./messaging.component.html",
  styleUrls: ["./messaging.component.css"],
})
export class MessagingComponent implements OnInit {
	@Input() msgPreference: SharedPreferencesI;
	@Output() closeRoomEvent = new EventEmitter<any>();
	@Output() addMemberEvent = new EventEmitter<any>();
	@Output() changePasswordEvent = new EventEmitter<any>();
	@ViewChild('scrollframe', {static: false}) scrollFrame: ElementRef;
	@ViewChildren('scroolMsg') itemElements: QueryList<any>;
	private scrollContainer: any;

	msg: string = '';
	session = this.sQuery.getSessionToken();
	name: string = '';
	messages: MessagesI[] = [];
	members: UserPublicInfoI[];
	banned: string[] = [];
	muted: string[] = [];
	room: ChatRoomI;
	subscription: any;
	imBanned: boolean = false;
	imMuted: boolean = false;
	directBanned: boolean = false;
	faShield = "fa-user-shield";
	constructor(
		private sQuery: SessionStorageQueryService,
		private chatService: ChatService,
		private dashboardService: DashboardService,
		private modalService: NgbModal
	) {}

	async ngOnInit(): Promise<void> {
		this.subscription = this.chatService.chatFragmentEmmiter.subscribe((data : any)=> {
			this.chatFragmentEmitterHandler(data);
		});
		this.chatService.chatPreferenceEmiter.subscribe((data : any)=> {
			if (data != undefined)
			{
				//console.log("Received data from chatPreferenceEmiter: ", data.chat);
				if (data.chat != undefined)
				{
					this.room = data.chat.active_room;
					this.banned = this.banned = this.room.banned.map(b => b.login);
					this.muted = this.muted = this.room.muted.map(m => m.login);
				}
			}
		});
		this.room = this.msgPreference.chat.active_room;
		this.members =  this.room.members;
		this.chatService.emit(eChat.ON_All_MSG, {room: this.room});
		//extract login for each object in this.room.banned
		this.banned = this.room.banned.map(b => b.login);
		this.muted = this.room.muted.map(m => m.login);
		/* console.log("room", this.room);
		console.log("prefernce", this.banned); */
		

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
		if (data.changeRoom != undefined)
			this.onRoomChange(data.changeRoom);
		else if (data.messages != undefined)
			this.messages = data.messages;
		else if (data.newMessage != undefined)
			if (data.newMessage.chatId == this.room.id)
				this.messages.push(data.newMessage);
	}
	private onRoomChange(newRoom: ChatRoomI){
		this.room = newRoom;
		this.banned = this.room.banned.map(b => b.login);
		this.muted = this.room.muted.map(m => m.login);
		this.chatService.emit(eChat.ON_All_MSG, {room: this.room});
	}
	closeRoom(){
		this.closeRoomEvent.emit();
	}
	changePassword(){
		this.openModal(this.room);
		console.log("changePassword msgFragment")
	}
	addMemberToChat(){
		this.addMemberEvent.emit()
	}
	leaveChat(){
		console.log("Leaving....");
		/* room.id, me*/
		if (confirm("Are you sure you want to leave?"))
			this.chatService.emit(eChat.ON_LEAVE_ROOM, this.room);
		else
			console.log("Not leaving room...");
		/*this.closeRoom(); */
	}
	openProfile(item : UserPublicInfoI){
		const modal = this.modalService.open(UserProfileComponent, {
			centered: false,
			animation: true,
			windowClass : "user-profile"
		  });
		  modal.componentInstance.user = item;
		  modal.componentInstance.preferences = this.msgPreference;
		  modal.componentInstance.passEntry.subscribe((receivedEntry: any) => {
			  console.log("pass entry resived: ", receivedEntry);
		  });
	}
	blockUser(item: UserPublicInfoI){
		this.chatService.emit(eChat.ON_BLOCK_USER, {user: item, room: this.room});
	}
	muteUser(item: UserPublicInfoI){		
		this.chatService.emit(eChat.ON_MUTE_USER, {user: item, room: this.room});
	}
	setAsAdmin(item: UserPublicInfoI){
		this.chatService.emit(eChat.ON_CHANGE_ROLE, {roomId: this.room.id, user: item.login});
	}
	isAdmin(item: UserPublicInfoI){
		return (this.room.admins.find(own => own.login == item.login) != undefined);
	}
	isFriend(item: UserPublicInfoI)
	{
		return (this.msgPreference.friends.find(friend => friend.login == item.login) != undefined);
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
	}
	openModal(room?: ChatRoomI) {
		const modal = this.modalService.open(ChangePasswordComponent, {
		  centered: false,
		  animation: true,
		});
		modal.componentInstance.room = room;
		modal.componentInstance.preferences = this.msgPreference;
		modal.componentInstance.passEntry.subscribe((receivedEntry: any) => {
			this.chatService.emit(eChat.ON_UPDATE_ROOM, {room : receivedEntry});
		});
	  }

	@HostListener('window:keyup', ['$event'])
	keyDown(event: KeyboardEvent): void {
		if (event.ctrlKey && event.code == "Enter" || event.ctrlKey && event.code == "NumpadEnter") {
			var messageBox: any;
			messageBox = document.getElementById('messageBox');
			messageBox.value += "\n";
		}
		else if (event.code == "Enter" || event.code == "NumpadEnter")
			this.send();
		
	}
}
