import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { eChat, eChatType, Nav, wSocket } from 'src/app/shared/ft_enums';
import { ChatI, SessionI, SharedPreferencesI } from 'src/app/shared/ft_interfaces'
import { SessionStorageQueryService, UserService } from 'src/app/shared/ft_services'
import { UserInfoI, UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { mDate } from 'src/app/utils/date';
import { UserProfileComponent } from '../content/chat/modal/user-profile/user-profile.component';
import { DashboardService } from '../content/dashboard/dashboard.service';
import { SocketService } from '../socket.service';
@Component({
  selector: 'app-right-nav',
  templateUrl: './right-nav.component.html',
  styleUrls: ['./right-nav.component.css']
})
export class RightNavComponent implements OnInit {
	@Input() rigtNavPreference: SharedPreferencesI;
	session: SessionI = this.sQuery.getSessionToken();
	me: UserInfoI;
	onlineUsers: any;
	pos = 0;
	gamePos = 0;

	
	constructor(private sQuery: SessionStorageQueryService,
		private userServie: UserService,
		private dashboardService: DashboardService,
		private socketService: SocketService,
		private router: Router,
		private modalService: NgbModal) {
		}
		
	async ngOnInit(): Promise<void> {
		this.me = this.rigtNavPreference.userInfo;
		//const resp = await this.userServie.getOnlineFriends(this.token);
		//this.onlineUsers = resp.data;
	}
	async removeFriend(friend: any){

		return (await this.dashboardService.removeFriendShip(friend, this.session))
	}
	async startChat(user: any){
		this.router.navigateByUrl(Nav.CHAT);
		var chatInfo: ChatI = <ChatI>{};
		chatInfo.type = eChatType.DIRECT;
		await this.socketService.emit(eChat.ON_START, {members: [user], chatInfo});

		//await this.socketService.emit(wSocket.CHAT_ON_START, {type: "one-to-one", memberOne: this.me,  memberTwo: user});
		//add to dm table if not exists
		//open chat
	}

	/** START: Game invitation */
	getGameInvitation(): UserPublicInfoI {
		if (this.gamePos >= this.rigtNavPreference.game_invitation.length)
			this.gamePos = this.rigtNavPreference.game_invitation.length - 1;
		this.gamePos < 0 ? (this.gamePos = 0) : 0;
		if (this.rigtNavPreference.game_invitation.length > 0)
			return (this.rigtNavPreference.game_invitation[this.gamePos])
		return (<UserPublicInfoI>{});
	}

	async acceptGameInvitation(){
		const user = this.rigtNavPreference.game_invitation[this.gamePos];
		return (await this.dashboardService.addFriendShip(user, this.session))// create a call and query to save state of accepted invitation

	}
	async declineGameInvitation(){
		const user = this.rigtNavPreference.game_invitation[this.gamePos];
		return (await this.dashboardService.removeFriendShip(user, this.session))// create a call and query to save state of declined invitation
	}
	nextGameInvitation(){
		if (this.gamePos < this.rigtNavPreference.game_invitation.length - 1)
			this.gamePos++;
		else
			this.gamePos = 0;
	}
	prevGameInvitation(){
		if (this.gamePos > 0)
			this.gamePos--;
		else
			this.gamePos = this.rigtNavPreference.game_invitation.length - 1;
		if (this.gamePos < 0)
			this.gamePos = 0;
	}
	/** END: Game invitation */

	/**START: Friend invitation */
	getInvitation(): UserPublicInfoI{

		if (this.pos >= this.rigtNavPreference.friend_invitation.length)
			this.pos = this.rigtNavPreference.friend_invitation.length - 1;
		this.pos < 0 ? (this.pos = 0) : 0;
		if (this.rigtNavPreference.friend_invitation.length > 0)
			return (this.rigtNavPreference.friend_invitation[this.pos])
		return (<UserPublicInfoI>{});
	}
	async accept(){
		const user = this.rigtNavPreference.friend_invitation[this.pos];
		return (await this.dashboardService.addFriendShip(user, this.session))

	}
	async decline(){
		const user = this.rigtNavPreference.friend_invitation[this.pos];
		return (await this.dashboardService.removeFriendShip(user, this.session))
	}
	next(){
		if (this.pos < this.rigtNavPreference.friend_invitation.length - 1)
			this.pos++;
		else
			this.pos = 0;
	}
	prev(){
		if (this.pos > 0)
			this.pos--;
		else
			this.pos = this.rigtNavPreference.friend_invitation.length - 1;
		if (this.pos < 0)
			this.pos = 0;
	}
	/** END: Friend invitation */
	openProfile(user: UserPublicInfoI){
		console.log("open profile from right nav")
		const modal = this.modalService.open(UserProfileComponent, {
			centered: false,
			animation: true,
			windowClass : "user-profile"
		  });
		  modal.componentInstance.user = user;
		  modal.componentInstance.preferences = this.rigtNavPreference ;
		  modal.componentInstance.passEntry.subscribe((receivedEntry: any) => {
			  console.log("pass entry resived: ", receivedEntry);
		  });
	}
}
