import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { SessionStorageQueryService, UserService } from 'src/app/shared/ft_services'
import { SharedPreferencesI } from '../shared/interface/iSharedPreferences';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
	session = this.sQuery.getSessionToken();
	_path: string = '/';
	isLoaded = false;
	sharedPreference: SharedPreferencesI = <SharedPreferencesI>{};
	constructor(
	private router: Router,
	private sQuery: SessionStorageQueryService,
	private authService: AuthService,
	private userService: UserService
	) {
		this.sharedPreference.expandRightNav = false;
	}

	async ngOnInit(): Promise<void> {
		this.isLoaded = false;
		if (this.session === undefined) 
			this.router.navigateByUrl('logIn');
		else
		{
			const resp = await this.userService.getUserInfo(this.session);
			if (resp.statusCode != 200)
			{
				this.sQuery.removeAll();
				this.router.navigateByUrl('logIn');
			}
			else
			{
				this.sharedPreference.userInfo = resp.data;
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
		this.sharedPreference.expandRightNav = true;
	}
	
	mouseLeave(){
		this.sharedPreference.expandRightNav = false;
	}
}
