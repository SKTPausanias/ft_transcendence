import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';
import { UserStatus } from 'src/app/shared/enums/eUser';
import { UserI } from 'src/app/shared/interface/user';
import { HomeService } from './home.service';
import { RightNavI } from 'src/app/shared/interface/rightNav';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
})

export class HomeComponent implements OnInit {
	user: UserI = this.sQuery.getUser();
	isLoaded: boolean = false;
	_path: string = '/';
	rightNavObj: RightNavI = {
		userInfo : {
			nickname: '',
			avatar: this.user.avatar,
		}
	} 
	constructor(
		private sQuery: LocalStorageQueryService,
		private router: Router,
		private homeService: HomeService
	) {}

	async ngOnInit(): Promise<void> {
		// sesion token: {
		// token: String -> encoded 
		//  status: String -> 1,2,3
		//  creation_time: ->
		//  expires_in: -> 
		//-------------
		//Only in postgress
		// 42 api authorization header: string
		// expiration_time: number
		// id: number
		//}
		//if !session token || session token expired
		//	go to auth
		//else
		//	call backend
		this.user = await this.homeService.getUserData();
		console.log("on init home: ", this.user);
		this.sQuery.setUser(this.user);
		if (!this.user.online)
			this.router.navigateByUrl('/auth');
		else 
			this.isLoaded = true;
	}

	logOut(): void {
		//remove sesion tocen from cache
		this.sQuery.removeUser();
		this.router.navigateByUrl('/auth');
		this.isLoaded = false;
	}

	updateToken(): void {
	}

	deleteAccount():void {
		this.homeService.deleteUserAccount();
		this.logOut();
	}
	mouseEnter(){
		this.rightNavObj.userInfo.nickname = this.user.nickname;
	}
	
	mouseLeave(){
		this.rightNavObj.userInfo.nickname = '';
	}
	setFragment(ev: any)
	{
		console.log('path: ', ev);
		this._path = ev;
	}
}