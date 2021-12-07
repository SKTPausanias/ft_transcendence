import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { eChat, eChatType } from "src/app/shared/ft_enums";
import { ChatI, SharedPreferencesI } from "src/app/shared/ft_interfaces";
import { SessionStorageQueryService } from "src/app/shared/ft_services";
import { UserPublicInfoI } from "src/app/shared/interface/iUserInfo";
import { DashboardService } from "../../../dashboard/dashboard.service";
import { ChatService } from "../../chat.service";

@Component({
	selector: "app-user-profile",
	templateUrl: "./user-profile.component.html",
	styleUrls: ["./user-profile.component.css"],
})
export class UserProfileComponent implements OnInit {
	@Input() public preferences: SharedPreferencesI;
	@Input() public user: UserPublicInfoI;
	@Output() passEntry: EventEmitter<any> = new EventEmitter();
	session = this.sQuery.getSessionToken();
	constructor(private modal: NgbActiveModal,
				private dashboardService: DashboardService,
				private chatService: ChatService,
				private sQuery: SessionStorageQueryService) {}

	ngOnInit(): void {
		console.log(this.user);
	}
	close() {
		this.modal.dismiss();
	}
	isFriend(){
		return (this.preferences.friends.find(item => item.login == this.user.login) != undefined)
	}
	async handleFriendship(){
		var resp;
		if (!this.isFriend())
			resp = await (this.dashboardService.addFriendShip(this.user, this.session));
		else
			resp = await this.dashboardService.removeFriendShip(this.user, this.session);
		console.log(resp);
	}
	startChat(){
		this.modal.dismiss();
		var chatInfo: ChatI = <ChatI>{};
		chatInfo.type = eChatType.DIRECT;
		this.chatService.emit(eChat.ON_START, {members: [this.user], chatInfo});
	}
	playPong(){
		alert("You're gonna dare your friend " + this.user.nickname);
	}


}
