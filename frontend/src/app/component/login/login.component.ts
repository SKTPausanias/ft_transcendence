import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../service/login/login.service';
import { Location } from '@angular/common';
import { AppComponent } from '../../app.component'

import { UserI } from '../../model/interface/user'
import { UserStatus } from '../../model/enums/userStatus';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})


export class LoginComponent implements OnInit {

	user: UserI = <UserI>{};
	isLoading: boolean = false;

  	constructor
		(
			private location:Location, private route: ActivatedRoute,
			private router: Router, private loginService: LoginService,
			private appComponent: AppComponent
		) { }

	async ngOnInit(): Promise<void> {
		this.user = this.appComponent.getUser();
		if (this.user.status == UserStatus.UNCONFIRMED)
			this.router.navigateByUrl('/confirmation');
		else if (this.user.status == UserStatus.CONFIRMED)
			this.router.navigateByUrl('/');
		/*if (this.appComponent.hasToken())
			this.router.navigateByUrl('/');*/
		const resp = await this.route.queryParams;
		const code = await this.getCode(resp);
		if (code !== undefined)
		{
			if (code == "401")
				this.router.navigateByUrl('/unauthorized');
			else 
			{
				this.isLoading = true;
				this.user = await this.loginService.getUserData(code);
				this.isLoading = false;

				if (this.user.status == UserStatus.UNREGISTERED)
				{
					this.router.navigateByUrl('/registration');
					this.user = this.appComponent.getUser();
					
				}
				else if (this.user.status == UserStatus.UNCONFIRMED)
					this.router.navigateByUrl('/confirmation');
				else 
					this.router.navigateByUrl('/');
			}
		}
		this.location.replaceState(this.location.path().split('?')[0], '');
		
	
	}
	async loginWith42(): Promise<void> {
		const url = 'https://api.intra.42.fr/oauth/authorize?client_id=54468a192544b06fef8e25a40d1e3d1febb65e21f600d6b57e1068e5aeba9823&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Flogin&response_type=code';
		window.location.href = url;
	}
	getCode(resp: any): string | undefined
	{
		if (resp._value.code !== undefined)
			return (resp._value.code);
		else if (resp._value.error)
			return ("401");
		return (undefined);
	}
}
