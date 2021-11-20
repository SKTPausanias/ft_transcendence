import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Nav, wSocket } from 'src/app/shared/ft_enums';
import { SessionI, SharedPreferencesI } from 'src/app/shared/ft_interfaces'
import { SessionStorageQueryService, UserService } from 'src/app/shared/ft_services'
import { UserInfoI } from 'src/app/shared/interface/iUserInfo';
import { mDate } from 'src/app/utils/date';
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
	
	constructor(private sQuery: SessionStorageQueryService,
		private userServie: UserService,
		private dashboardService: DashboardService,
		private socketService: SocketService,
		private router: Router) {
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
		await this.socketService.emit(wSocket.ON_START, {members: [user]});

		//await this.socketService.emit(wSocket.CHAT_ON_START, {type: "one-to-one", memberOne: this.me,  memberTwo: user});
		//add to dm table if not exists
		//open chat
	}
}
