import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {  Router } from '@angular/router';
import { UserClass } from 'src/app/shared/ft_clases';
import { UserRegI } from 'src/app/shared/ft_interfaces';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { AuthService } from '../auth.service';
import { environment } from 'src/environments/environment'

@Component({
	selector: 'app-sign-up',
	templateUrl: './sign-up.component.html',
	styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent implements OnInit {
	user: UserRegI = <UserRegI>{};

	


	reEmail: string;
	rePassword: string;
	inputError: boolean;
	dialogMsg: string[];
	isLoaded: boolean = false;
	constructor(private sQuery: SessionStorageQueryService,
				private authService: AuthService,
				private router: Router) {
					this.user.factor_enabled = false;
		}

	ngOnInit(): void {
		if (this.sQuery.getUser() !== undefined)
			this.router.navigateByUrl('');
		else
			this.isLoaded = true;
	}
	async signUp(data: any) {
		this.dialogMsg = [];
		if (this.userInputCheck(data))
		{
			this.user = UserClass.getUser(data);
			console.log("user from signUp: ", this.user);
			console.log("data: ", data);
			const resp = await this.authService.signUp(this.user);
			console.log("resp: ", resp);
			if (resp.statusCode == 301)
      			this.router.navigateByUrl(resp.data.redirect + "?email=" + resp.data.email);
			else if (resp.statusCode >= 400)
			{
				this.inputError = true;
				this.dialogMsg.push(resp.data.error);
			}
		}
	}
	signUp42() {
		this.sQuery.setNavParam({redirectedFrom: 'signUp'});
		const url = environment.env.ftAuthUrl;
		window.location.href = url;
	}
	userInputCheck(values: any): boolean{
		this.dialogMsg = [];
		if (values.email != values.reEmail || values.password != values.rePassword)
		{
			this.inputError = true;
			if (values.email != values.reEmail)
				this.dialogMsg.push("emails dont't match!");
			if (values.password != values.rePassword)
				this.dialogMsg.push("passwords don't match!");
			return (false);
		}
		else
			this.inputError = false;
		return (true);
	}
	goToLogin(){
		this.router.navigateByUrl('/logIn');
	}
}
