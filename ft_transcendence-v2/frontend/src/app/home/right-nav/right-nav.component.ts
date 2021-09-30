import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { RightNavI } from 'src/app/shared/interface/rightNav';
import { SessionStorageQueryService } from 'src/app/shared/service/session-storage-query.service';

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
		private authService: AuthService) {
		
	}

	async ngOnInit(): Promise<void> {
		const resp = await this.authService.getOnlineUsers(this.token);
		console.log("online users = ", resp.data);
		console.log("online show = ", this.item.showInfo);
		this.onlineUsers = resp.data;
	}
}
