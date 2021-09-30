import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { SessionStorageQueryService } from 'src/app/shared/service/session-storage-query.service';
import { AuthService } from '../auth.service';

@Component({
selector: 'app-sign-in',
templateUrl: './sign-in.component.html',
styleUrls: ['./sign-in.component.css'],
})
export class SignInComponent implements OnInit {
	@ViewChild('pass') ePass: ElementRef<HTMLInputElement>;
	nickname: string;
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
		console.log(this.sQuery.getSessionToken());
		if (this.sQuery.getSessionToken() !== undefined)
			this.router.navigateByUrl('');
		else
			this.isLoaded = true;
	}
	async login(data: any) {
		this.dialogMsg = [];
		this.inputError = false;
		const resp = await this.authService.login(data.nickname, data.password);
		console.log(resp);
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
			this.router.navigateByUrl('');
		}
	}
	login42() {
		this.sQuery.setNavParam({redirectedFrom: 'logIn'});
		const url = 'https://api.intra.42.fr/oauth/authorize?client_id=54468a192544b06fef8e25a40d1e3d1febb65e21f600d6b57e1068e5aeba9823&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Fauth&response_type=code';
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
