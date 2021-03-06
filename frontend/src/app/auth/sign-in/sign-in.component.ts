import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { AuthService } from '../auth.service';
import { environment } from 'src/environments/environment'

@Component({
selector: 'app-sign-in',
templateUrl: './sign-in.component.html',
styleUrls: ['./sign-in.component.css'],
})
export class SignInComponent implements OnInit {
	@ViewChild('pass') ePass: ElementRef<HTMLInputElement>;
	login: string;
	password: string;
	isLoaded: boolean = false;
	dialogMsg: string[];
	inputError: boolean;

	constructor(
	private router: Router,
	private sQuery: SessionStorageQueryService,
	private authService: AuthService
	) {}

	ngOnInit(): void {
		if (this.sQuery.getSessionToken() !== undefined)
			this.router.navigateByUrl('');
		else
			this.isLoaded = true;
	}
	async signIn(data: any) {
		this.dialogMsg = [];
		this.inputError = false;
		const resp = await this.authService.login(data.login, data.password);
		if (resp.statusCode == 301)
      		this.router.navigateByUrl(resp.data.redirect + "?email=" + resp.data.email);
		else if (resp.statusCode >= 400)
		{
			this.inputError = true;
			this.dialogMsg.push(resp.data.error);
		}
		else
		{
			this.sQuery.setSessionToken(resp.data);
			//caller to backend getting userInfo
			//this.sQueri.setUser(this.user o resp....);
			this.ngOnInit();
			//this.router.navigateByUrl('');
		}
	}
	login42() {
		this.isLoaded = false;
		this.sQuery.setNavParam({redirectedFrom: 'logIn'});
		const url = environment.env.ftAuthUrl;
		window.location.href = url;
	}
	showPassword(e: any) {
		if (e.target.checked)
			this.ePass.nativeElement.type = 'text';
		else
			this.ePass.nativeElement.type = 'password';
	}
	forgotPassword() {
		this.router.navigateByUrl('password-reset');
	}
	signUp() {
		this.router.navigateByUrl('/signUp');
	}
}
