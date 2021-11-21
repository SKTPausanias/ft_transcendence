import { Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { eChat } from "src/app/shared/ft_enums";
import { ChatRoomI, MessagesI, SharedPreferencesI } from "src/app/shared/ft_interfaces";
import { SessionStorageQueryService } from "src/app/shared/ft_services";
import { UserPublicInfoI } from "src/app/shared/interface/iUserInfo";
import { ChatService } from "../chat.service";

 interface ms{
	from: String,
	msg: String
}
@Component({
  selector: "app-messaging",
  templateUrl: "./messaging.component.html",
  styleUrls: ["./messaging.component.css"],
})
export class MessagingComponent implements OnInit {
	@Input() msgPreference: SharedPreferencesI;
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
	constructor(
		private sQuery: SessionStorageQueryService,
		private chatService: ChatService
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
		if (data.action == 'room-change')
			this.onRoomChange();
		else if (data.action == 'loadAllMsg')
		{
			this.messages = data.messages;
			//console.log("|" + this.messages[0].message + "|");
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
	isPrivateRoom(){
		return (this.msgPreference.chat.active_room.img != undefined);
	}
	getImage(){
		return (this.msgPreference.chat.active_room.img);
	}
}
