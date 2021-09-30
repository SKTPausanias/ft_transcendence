import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { RightNavI } from '../shared/interface/rightNav';
import { UserInfoI } from '../shared/user/userI';
import { SessionStorageQueryService } from '../shared/service/session-storage-query.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
	session = this.sQuery.getSessionToken();
	_path: string = '/';
	isLoaded = false;
	rightNavObj: RightNavI = <RightNavI>{};
	constructor(
	private router: Router,
	private sQuery: SessionStorageQueryService,
	private authService: AuthService
	) {
		this.rightNavObj.showInfo = false;
	}

	async ngOnInit(): Promise<void> {
		this.isLoaded = false;
		if (this.session === undefined) 
			this.router.navigateByUrl('logIn');
		else
		{
			const resp = await this.authService.getUserInfo(this.session);
			if (resp.statusCode != 200)
			{
				this.sQuery.removeAll();
				this.router.navigateByUrl('logIn');
			}
			else
			{
				this.rightNavObj.userInfo = resp.data;
				this.isLoaded = true;
			}
		}
	}
	setFragment(ev: any) {
		const tmpUrl = this.router.url;
		const pos = ev.indexOf("?");
		this._path = tmpUrl.substring(0, pos >= 0 ? pos : ev.length);
	}
	mouseEnter(){
		this.rightNavObj.showInfo = true;
	}
	
	mouseLeave(){
		this.rightNavObj.showInfo = false;
	}
}
