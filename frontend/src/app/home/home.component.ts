import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageQueryService, UserService } from 'src/app/shared/ft_services'
import { SharedPreferencesI } from '../shared/interface/iSharedPreferences';
import { UserInfoI, UserPublicInfoI } from '../shared/interface/iUserInfo';
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
	friendsOnline: any = [];
	constructor(
	private router: Router,
	private sQuery: SessionStorageQueryService,
	private userService: UserService,
	private homeService: HomeService,
	private socketService: SocketService
	) {
		this.sharedPreference.userInfo = <UserInfoI>{};
		this.sharedPreference.friends = [];
		this.sharedPreference.expandRightNav = false;
		this.sharedPreference.friend_invitation = [];
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
			this.socketService.connect(this.session, this.sharedPreference);
			this.socketService.receivedFilter.subscribe((data : any)=> {
				this.sharedPreference.userInfo = data.userInfo;
				this.sharedPreference.friends = data.friends;
				this.sharedPreference.friend_invitation = data.friend_invitation;
				this.isLoaded = true;
			})
			/* if (this.sharedPreference.userInfo !== undefined)
				this.isLoaded = true;
			else
				this.isLoaded = false; */
			/* 
			const resp = await this.userService.getUserInfo(this.session);
			if (resp.statusCode != 200)
				await this.homeService.closeSession();
			else
			{
				this.sharedPreference.userInfo = resp.data;
				this.isLoaded = true;
			} */
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
