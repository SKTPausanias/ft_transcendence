import { Component, HostListener, OnInit } from '@angular/core';
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
	sessionWorker = new Worker(new URL('src/app/home/home.worker', import.meta.url));
	flag: boolean;
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
	@HostListener('window:keydown', [ '$event' ])
	async keydown(event: any) {
		await this.handleSession();
	}
	@HostListener('window:mousemove', [ '$event' ])
	async mousemove(event: any) {
		await this.handleSession();
	}
  async handleSession(){
	this.session = this.sQuery.getSessionToken();
	var margin = 1800; //30min
	if (this.session !== undefined)
	{
		if (mDate.expired(this.session.expiration_time))
		{
			this.authService.logout(this.session);
			this.sQuery.removeAll();
			this.router.navigateByUrl('logIn');
		}
		else if (this.session.expiration_time - mDate.timeNowInSec() <= margin && !this.flag)
		{
			this.flag = true;
			const resp = await this.authService.renewSession(this.session);
			if (resp.statusCode == 200)
			{
				this.session.expiration_time = resp.data.expiration_time;
				this.sQuery.setSessionToken(this.session);
				this.flag = false;
			}
		}
	}
  }

}
