import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { AuthService } from './auth.service';


@Component({
	selector: 'app-auth',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
	code: string;
	isLoaded: boolean;
	navData: any;
	adminMail: string = '';
	response: any;
	errorMsg: string = "Something wen't wrong";
	constructor(private router: Router,
				private location: Location,
				private sQuery: SessionStorageQueryService,
				private authService: AuthService) {
		this.navData = sQuery.getNavParam();
		sQuery.removeNavParam();
		this.code = router.parseUrl(router.url).queryParams.code;
		this.location.replaceState(this.location.path().split('?')[0], '');
	}

	async ngOnInit(): Promise<void>{
		if (this.code !== undefined)
		{
			if (this.getRedirectedFromUrl() == 'logIn')
				this.response = await this.authService.ftLogin(this.code);
			if (this.getRedirectedFromUrl() == 'signUp')
				this.response = await this.authService.ftSignUp(this.code);
			if (this.response.statusCode == 200)
			{
				this.sQuery.setSessionToken(this.response.data);			
				this.router.navigateByUrl('');
			}
			else if (this.response.statusCode == 301)
				this.router.navigateByUrl(this.response.data.redirect + "?email=" + this.response.data.email);
			else
			{
				this.setErrorMsg();
				this.isLoaded = true;
			}
		}
		else
			this.isLoaded = true;
	}

	back(){
		this.router.navigateByUrl(this.getRedirectedFromUrl());
	}
	getRedirectedFromUrl(){
		if (this.navData !== undefined && this.navData.redirectedFrom)
			return (this.navData.redirectedFrom)
		else
			return ('');
	}
	private setErrorMsg(){
		if (this.getRedirectedFromUrl() == 'logIn')
			this.errorMsg = "You are not registred with 42. Register first";
		if (this.getRedirectedFromUrl() == 'signUp')
		{
			this.errorMsg =  "Look's like someone alredy is registred with your intra login or email."
			this.adminMail =  "Contact the administrator: ft.transcendence.42@gmail.com"
		}
	}
}
