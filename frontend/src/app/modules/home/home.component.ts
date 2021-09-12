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
		this.user = await this.homeService.getUserData();
		this.sQuery.setUser(this.user);
		console.log(this.sQuery.getUser());
		if (this.user.status !== UserStatus.CONFIRMED)
			this.router.navigateByUrl('/auth');
		else 
			this.isLoaded = true;
		console.log(this.user);
	}

	logOut(): void {
		this.sQuery.removeUser();
		this.router.navigateByUrl('/auth');
		this.isLoaded = false;
	}

	updateToken(): void {
		console.log('Token updated!! -> ');
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
		console.log("setFragment: ",ev);
		this._path = ev;
	}
}