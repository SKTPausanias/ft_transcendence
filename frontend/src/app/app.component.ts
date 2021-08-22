import { Component } from '@angular/core';
import { LoginService } from './service/login/login.service';
import { UserI } from "./model/interface/user"
import { Observable } from 'rxjs';
import { UserRole } from './enums/roles'
import { LocalStorageService } from './service/local-storage/local-storage.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [LoginService],
})
export class AppComponent {
	title = 'auth-test';
	user: UserI = <UserI>{};
	constructor (private localStorageService: LocalStorageService){}

	setUser(userData: any): void{
		this.user.token = "12345";
		this.user.id = userData.id;
		this.user.firstName = userData.first_name;
		this.user.lastName = userData.last_name;
		this.user.username = userData.login;
		this.user.email = userData.email;
		this.user.role = UserRole.ADMIN;
		this.localStorageService.set("test", this.user);
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

}
