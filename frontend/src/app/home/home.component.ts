import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageQueryService, UserService } from 'src/app/shared/ft_services'
import { SharedPreferencesI } from '../shared/interface/iSharedPreferences';
import { HomeService } from './home.service';
import { SocketService } from './socket.service';

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
	private userService: UserService,
	private homeService: HomeService,
	private socketService: SocketService
	) {
		this.sharedPreference.expandRightNav = false;
	}

	async ngOnInit(): Promise<void> {
		this.isLoaded = false;
		if (this.session === undefined) 
		{
			await this.homeService.terminateWorker();
			this.router.navigateByUrl('logIn');
		}
		else
		{
			this.homeService.listenSessionWorker();
			this.socketService.connect(this.session);
			
			const resp = await this.userService.getUserInfo(this.session);
			if (resp.statusCode != 200)
				await this.homeService.closeSession();
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
	@HostListener('window:keydown', [ '$event' ])
	async keydown(event: any) {
		await this.homeService.listenActivity();
	}
	@HostListener('window:mousemove', [ '$event' ])
	async mousemove(event: any) {
		await this.homeService.listenActivity();
	}
}
