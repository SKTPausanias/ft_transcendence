import { Component, Input, OnInit } from '@angular/core';
import { RightNavI } from 'src/app/shared/ft_interfaces'
import { SessionStorageQueryService, UserService } from 'src/app/shared/ft_services'
@Component({
  selector: 'app-right-nav',
  templateUrl: './right-nav.component.html',
  styleUrls: ['./right-nav.component.css']
})
export class RightNavComponent implements OnInit {
	@Input() item: RightNavI;
	token = this.sQuery.getSessionToken();
	onlineUsers: any;
	
	constructor(private sQuery: SessionStorageQueryService,
		private userServie: UserService) {
		
	}

	async ngOnInit(): Promise<void> {
		const resp = await this.userServie.getOnlineUsers(this.token);
		console.log("online users = ", resp.data);
		console.log("online show = ", this.item.showInfo);
		this.onlineUsers = resp.data;
	}
}
