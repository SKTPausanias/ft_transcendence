import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { UserClass } from 'src/app/shared/user/userClass';
import { UserRegI } from 'src/app/shared/user/userI';
import { SessionStorageQueryService } from 'src/app/shared/service/session-storage-query.service';
import { AuthService } from '../auth.service';

@Component({
	selector: 'app-sign-up',
	templateUrl: './sign-up.component.html',
	styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent implements OnInit {
	user: UserRegI = <UserRegI>{};

	


	reEmail: string = "belinskisdainis@gmail.com";
	rePassword: string = "123";
	inputError: boolean;
	dialogMsg: string[];
	isLoaded: boolean = false;
	constructor(private sQuery: SessionStorageQueryService,
				private authService: AuthService,
				private router: Router) {
		this.user.factor_enabled = true;
		this.user.first_name ="Dainis";
		this.user.last_name ="Belinskis";
		this.user.nickname ="dbelinsk";
		this.user.email ="belinskisdainis@gmail.com";
		this.user.password ="123";
		this.user.factor_enabled = true;
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
			const resp = await this.authService.signUp(this.user);
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
		const url = 'https://api.intra.42.fr/oauth/authorize?client_id=54468a192544b06fef8e25a40d1e3d1febb65e21f600d6b57e1068e5aeba9823&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Fauth&response_type=code';
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
