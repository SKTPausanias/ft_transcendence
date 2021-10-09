import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { SessionStorageQueryService, UserService } from 'src/app/shared/ft_services'
import { SharedPreferencesI } from '../shared/interface/iSharedPreferences';
import { mDate } from '../utils/date';

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
	sessionWorker = new Worker(new URL('src/app/app.worker', import.meta.url));
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
		{
			this.sessionWorker.postMessage('stop');
			this.router.navigateByUrl('logIn');
		}
		else
		{
			await this.listenSessionWorker();
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
	listenSessionWorker(){
		this.sessionWorker.onmessage = async ({ data }) => {
			if ((this.session = this.sQuery.getSessionToken()) !== undefined)
			{
				if (mDate.expired(this.session.expiration_time))
				{
					const resp = await this.authService.checkSession(this.session);
					if (resp.statusCode == 200)
					{
						this.session.expiration_time = resp.data.expiration_time;
						this.sQuery.setSessionToken(this.session);
						this.sessionWorker.postMessage(this.session.expiration_time);
					}
					else
					{
						this.authService.logout(this.session);
						this.sQuery.removeAll();
						this.router.navigateByUrl("logIn");
					}
				}
				else
					this.sessionWorker.postMessage(this.session.expiration_time);
			}
		};
		this.sessionWorker.postMessage("init");
	}
}
