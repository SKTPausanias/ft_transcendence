import { Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { Messages } from "src/app/shared/class/cMessages";
import { SharedPreferencesI } from "src/app/shared/ft_interfaces";
import { SessionStorageQueryService } from "src/app/shared/ft_services";
import { mDate } from "src/app/utils/date";
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
	@Input() identity: any;
	@Input() messages: Messages[];
	@Input() isChannel: boolean | undefined;
	@ViewChild('scrollframe', {static: false}) scrollFrame: ElementRef;
	@ViewChildren('scroolMsg') itemElements: QueryList<any>;
	private scrollContainer: any;

	msg: string = '';
	session = this.sQuery.getSessionToken();
	name: string = '';

	constructor(
		private chatService: ChatService,
		private sQuery: SessionStorageQueryService
	) {}

	async ngOnInit(): Promise<void> {
		this.isChannel ? (this.name = this.identity.name_chat) : (this.name = this.identity.nickname);
		console.log(this.identity);
		var element = document.getElementById("oMsg");
		if(element != null && element != undefined)
			element.scrollTop = element.scrollHeight;
			console.log(this.isChannel);
		

	}
	ngAfterViewInit() {
		this.scrollContainer = this.scrollFrame.nativeElement;
		this.itemElements.changes.subscribe(_ => this.onItemElementsChanged());
		this.scrollToBottom();
	}
	async send(){
		this.msg = this.msg.trim();
		if (this.msg.length <= 0 )
			return ;
		if (this.isChannel)
			await this.chatService.sendGroupMessage(this.msg, this.session, this.identity, mDate.timeNowInSec(), this.msgPreference.userInfo.nickname, this.msgPreference.userInfo);
		else
			await this.chatService.sendMessage(this.msg, this.session, this.identity, mDate.timeNowInSec(), this.msgPreference.userInfo.nickname);

		//console.log("sending msg: |", trmMsg, "|");
		//this.msgList.push({from: 'me', msg: trmMsg});
		this.msg = '';
	}
	private onItemElementsChanged(): void {
		console.log("detected");
		this.scrollToBottom();
	  }
	private scrollToBottom(): void {
		this.scrollContainer.scroll({
		  top: this.scrollContainer.scrollHeight,
		  left: 0
		});
	  }
}
