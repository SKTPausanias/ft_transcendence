import { Component } from '@angular/core';
import { LoginService } from './service/login/login.service';
import { UserI } from "./model/interface/user"
import { Observable } from 'rxjs';
import { UserRole } from './enums/roles'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [LoginService],
})
export class AppComponent {
	title = 'auth-test';
	user: UserI = <UserI>{};
	setUser(userData: any): void{
		this.user.token = "12345";
		this.user.id = userData.id;
		this.user.firstName = userData.first_name;
		this.user.lastName = userData.last_name;
		this.user.username = userData.login;
		this.user.email = userData.email;
		this.user.role = UserRole.ADMIN;
	}
	hasToken(): boolean{
		return (this.user.token !== undefined)
	}
	getUser(): UserI
	{
		return (this.user);
	}
}
