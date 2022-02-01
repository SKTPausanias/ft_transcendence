import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { eChat, eChatType, ePlay, Nav, wSocket } from 'src/app/shared/ft_enums';
import { ChatI, SessionI, SharedPreferencesI } from 'src/app/shared/ft_interfaces'
import { SessionStorageQueryService, UserService } from 'src/app/shared/ft_services'
import { UserInfoI, UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { mDate } from 'src/app/utils/date';
import { UserProfileComponent } from '../content/chat/modal/user-profile/user-profile.component';
import { DashboardService } from '../content/dashboard/dashboard.service';
import { PlayService } from '../content/play/play.service';
import { SocketService } from '../socket.service';
@Component({
  selector: 'app-right-nav',
  templateUrl: './right-nav.component.html',
  styleUrls: ['./right-nav.component.css']
})
export class RightNavComponent implements OnInit {
	@Input() rightNavPreference: SharedPreferencesI;
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
		private modalService: NgbModal,
		private playService: PlayService) {
		}
		
	async ngOnInit(): Promise<void> {
		this.me = this.rightNavPreference.userInfo;
		this.socketService.emit(ePlay.ON_LOAD_ALL_GAME_INVITATIONS);
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
		if (this.gamePos >= this.rightNavPreference.game_invitation.length)
			this.gamePos = this.rightNavPreference.game_invitation.length - 1;
		this.gamePos < 0 ? (this.gamePos = 0) : 0;
		if (this.rightNavPreference.game_invitation.length > 0)
			return (this.rightNavPreference.game_invitation[this.gamePos])
		return (<UserPublicInfoI>{});
	}

	async acceptGameInvitation(){
		const user = this.rightNavPreference.game_invitation[this.gamePos];
		this.playService.emit(ePlay.ON_ACCEPT_INVITATION, user);

	}
	async declineGameInvitation(){
		const user = this.rightNavPreference.game_invitation[this.gamePos];
		this.playService.emit(ePlay.ON_DECLINE_INVITATION, user);
	}
	nextGameInvitation(){
		if (this.gamePos < this.rightNavPreference.game_invitation.length - 1)
			this.gamePos++;
		else
			this.gamePos = 0;
	}
	prevGameInvitation(){
		if (this.gamePos > 0)
			this.gamePos--;
		else
			this.gamePos = this.rightNavPreference.game_invitation.length - 1;
		if (this.gamePos < 0)
			this.gamePos = 0;
	}
	/** END: Game invitation */

	/**START: Friend invitation */
	getInvitation(): UserPublicInfoI{

		if (this.pos >= this.rightNavPreference.friend_invitation.length)
			this.pos = this.rightNavPreference.friend_invitation.length - 1;
		this.pos < 0 ? (this.pos = 0) : 0;
		if (this.rightNavPreference.friend_invitation.length > 0)
			return (this.rightNavPreference.friend_invitation[this.pos])
		return (<UserPublicInfoI>{});
	}
	async accept(){
		const user = this.rightNavPreference.friend_invitation[this.pos];
		return (await this.dashboardService.addFriendShip(user, this.session))

	}
	async decline(){
		const user = this.rightNavPreference.friend_invitation[this.pos];
		return (await this.dashboardService.removeFriendShip(user, this.session))
	}
	next(){
		if (this.pos < this.rightNavPreference.friend_invitation.length - 1)
			this.pos++;
		else
			this.pos = 0;
	}
	prev(){
		if (this.pos > 0)
			this.pos--;
		else
			this.pos = this.rightNavPreference.friend_invitation.length - 1;
		if (this.pos < 0)
			this.pos = 0;
	}
	/** END: Friend invitation */
	openProfile(user: UserPublicInfoI){
		const modal = this.modalService.open(UserProfileComponent, {
			centered: false,
			animation: true,
			windowClass : "user-profile"
		  });
		  modal.componentInstance.user = user;
		  modal.componentInstance.isMe = user.login == this.rightNavPreference.userInfo.login;
		  modal.componentInstance.preferences = this.rightNavPreference ;
		  modal.componentInstance.passEntry.subscribe((receivedEntry: any) => {
		  });
	}
	openMyProfile()
	{
		this.openProfile({
			login: this.rightNavPreference.userInfo.login,
			first_name: this.rightNavPreference.userInfo.first_name,
			last_name: this.rightNavPreference.userInfo.last_name,
			nickname: this.rightNavPreference.userInfo.nickname,
			avatar: this.rightNavPreference.userInfo.avatar,
			online: true,
			in_game: this.rightNavPreference.userInfo.in_game,
			hits: this.rightNavPreference.userInfo.hits,
			victories: this.rightNavPreference.userInfo.victories,
			defeats: this.rightNavPreference.userInfo.defeats
		});
	}
}
