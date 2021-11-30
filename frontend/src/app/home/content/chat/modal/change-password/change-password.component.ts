import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ChatPasswordUpdateI, ChatRoomI, SessionI, SharedPreferencesI } from "src/app/shared/ft_interfaces";
import { SessionStorageQueryService } from "src/app/shared/ft_services";
import { ChatService } from "../../chat.service";
import { StatusMessageI } from "../statusMsgI";

@Component({
	selector: "app-change-password",
	templateUrl: "./change-password.component.html",
	styleUrls: ["../chat-modal.component.css"],
})
export class ChangePasswordComponent implements OnInit {
	@Input() public preferences: SharedPreferencesI;
	@Input() public room: ChatRoomI;
	@Output() passEntry: EventEmitter<any> = new EventEmitter();
	password: string | undefined;
	repassword: string | undefined;
	addPassword: boolean;
	statusMsg: StatusMessageI = <StatusMessageI>{};
	session = this.sQuery.getSessionToken();


	constructor(private modal: NgbActiveModal,
				private chatService: ChatService,
				private sQuery: SessionStorageQueryService) {}

	ngOnInit(): void {
		this.addPassword = this.room.protected;
		console.log("room: ", this.room);
		console.log("prefs: ", this.preferences.chat);
	}
	passCheckBox(){
		this.password = this.repassword = undefined;
		this.statusMsg = <StatusMessageI>{};
		!this.addPassword ? (this.addPassword = false) : (this.addPassword = true);
	}
	async save() {
		var msg;
		if ((msg = this.checkPassword()) != undefined)
			return this.startStatusMsgTimer(<StatusMessageI>{
				isError: true,
				message: msg
			})
		const ret = await this.chatService.updatePassChannel(this.session, <ChatPasswordUpdateI>{
			chatId: this.room.id,
			protected: this.addPassword,
			password: this.password
		});
		console.log("ret from update pwd: ", ret);
		if (ret.statusCode != 200)
			return this.startStatusMsgTimer(<StatusMessageI>{
				isError: true,
				message: ret.data.error
			})
		this.passEntry.emit(this.room);
		this.modal.dismiss();
	}

	checkPassword(): string | undefined{
		if (this.password != this.repassword)
			return  ("Passwords dosn't match");
		else if (this.addPassword && (this.password == undefined || !this.password.length))
			return  ("Channel marked as protected. Please select password");
		return (undefined);
	}



	cancel() {
		this.modal.dismiss();
	}
	startStatusMsgTimer(msgStatus: StatusMessageI)
	{
		this.statusMsg = msgStatus;
		var counter = 3;
		let intervalId = setInterval(() => {
			counter--;
			if (counter-- == 0)
			{
				this.statusMsg = <StatusMessageI>{};
				clearInterval(intervalId)
			}
		}, 1000)
	}
}
