import { Component, Input, OnInit } from "@angular/core";
import { SessionI, SharedPreferencesI } from "src/app/shared/ft_interfaces";
import { SessionStorageQueryService } from "src/app/shared/ft_services";
import { UserPublicInfoI } from "src/app/shared/interface/iUserInfo";
import { DashboardService } from "../../dashboard.service";

@Component({
	selector: "app-friend-invitation",
	templateUrl: "./friend-invitation.component.html",
	styleUrls: ["./friend-invitation.component.css"],
})
export class FriendInvitationComponent implements OnInit {
	@Input() friendPreferneces: SharedPreferencesI;
	pos = 0;
	session: SessionI = this.sQuery.getSessionToken();
	invitations: UserPublicInfoI[] = [];
	constructor(
		private dashboardService: DashboardService,
		private sQuery: SessionStorageQueryService
	) {}

	ngOnInit(): void {
		if (this.friendPreferneces.friend_invitation !== undefined)
			this.invitations = this.friendPreferneces.friend_invitation;
	}
	getInvitation(): string{

		if (this.pos >= this.friendPreferneces.friend_invitation.length)
			this.pos = this.friendPreferneces.friend_invitation.length - 1;
		this.pos < 0 ? (this.pos = 0) : 0;
		if (this.friendPreferneces.friend_invitation.length > 0)
			return (this.friendPreferneces.friend_invitation[this.pos].nickname)
		return ("EMPTY");
	}
	async accept(){
		const user = this.friendPreferneces.friend_invitation[this.pos];
		return (await this.dashboardService.addFriendShip(user, this.session))

	}
	async decline(){
		const user = this.friendPreferneces.friend_invitation[this.pos];
		return (await this.dashboardService.removeFriendShip(user, this.session))
	}
	next(){
		if (this.pos < this.friendPreferneces.friend_invitation.length - 1)
			this.pos++;
		else
			this.pos = 0;
	}
	prev(){

		if (this.pos > 0)
			this.pos--;
		else
			this.pos = this.friendPreferneces.friend_invitation.length - 1;
		if (this.pos < 0)
			this.pos = 0;
	}
}
