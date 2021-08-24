import { Component } from '@angular/core';
import { LoginService } from './service/login/login.service';
import { UserI } from "./model/interface/user"
import { Observable } from 'rxjs';
import { UserRole } from './model/enums/roles'
import { Router } from '@angular/router';
import { LocalStorageService } from './service/local-storage/local-storage.service'
import * as uuid from 'uuid';
import { UserStatus } from './model/enums/userStatus';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [LoginService],
})
export class AppComponent {
	title = 'auth-test';
	user: UserI = <UserI>{};
	constructor (private localStorageService: LocalStorageService, private router: Router,){}

	setUser(userData: any): void{
		//this.user.token = "123456"; //uuid.v4()
		
		this.localStorageService.set("test", userData);
	}
	hasToken(): boolean{
		const tmp = this.localStorageService.get("test")
		if (tmp && tmp.token !== undefined)
			return (true);
		return (false)
	}
	getUser(): any
	{
		const tmp = this.localStorageService.get("test");
		if (!tmp)
			return (<UserI>{});
		return tmp;
	}
	logoutUser(): void{
		this.localStorageService.remove("test");
	}

	refreshToken(): boolean {
		if (Date.now() > this.user.token_expires)
		{
			this.localStorageService.remove("test");
			this.router.navigateByUrl("/login");
			console.log("User token has expired");
			return false;
		}
		this.user.token_expires = Date.now() + 5 * 1000; //60 second => date.now returns timestamp in milis so 60 * 1000
		console.log("Refresh: " + this.user.token_expires);
		return true;
	}
}
