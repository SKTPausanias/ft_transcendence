import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { RightNavI } from 'src/app/shared/ft_interfaces'
import { SessionStorageQueryService, UserService } from 'src/app/shared/ft_services'

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
	private authService: AuthService,
	private userService: UserService
	) {
		this.rightNavObj.showInfo = false;
	}

	async ngOnInit(): Promise<void> {
		console.log("home onInit");
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
				this.sQuery.setUser(resp.data);
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
