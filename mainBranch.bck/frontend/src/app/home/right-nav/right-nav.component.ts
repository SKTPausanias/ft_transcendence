import { Component, Input, OnInit } from '@angular/core';
import { SessionI, SharedPreferencesI } from 'src/app/shared/ft_interfaces'
import { SessionStorageQueryService, UserService } from 'src/app/shared/ft_services'
import { mDate } from 'src/app/utils/date';
import { DashboardService } from '../content/dashboard/dashboard.service';
@Component({
  selector: 'app-right-nav',
  templateUrl: './right-nav.component.html',
  styleUrls: ['./right-nav.component.css']
})
export class RightNavComponent implements OnInit {
	@Input() rigtNavPreference: SharedPreferencesI;
	session: SessionI = this.sQuery.getSessionToken();
	onlineUsers: any;
	
	constructor(private sQuery: SessionStorageQueryService,
		private userServie: UserService,
		private dashboardService: DashboardService) {
		
	}

	async ngOnInit(): Promise<void> {
		//const resp = await this.userServie.getOnlineFriends(this.token);
		//this.onlineUsers = resp.data;
	}
	async removeFriend(friend: any){

		return (await this.dashboardService.removeFriendShip(friend, this.session))
	}
}
