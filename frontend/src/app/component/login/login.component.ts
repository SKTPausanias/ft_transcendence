import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../service/login/login.service';
import { Location } from '@angular/common';
import { AppComponent } from '../../app.component'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})


export class LoginComponent implements OnInit {

	isLoading: boolean = false;

  	constructor
		(
			private location:Location, private route: ActivatedRoute,
			private router: Router, private loginService: LoginService,
			private appComponent: AppComponent
		) { }

	async ngOnInit(): Promise<void> {
		const resp = await this.route.queryParams;
		const code = await this.getCode(resp);
		if (code !== undefined)
		{
			this.isLoading = true;
			await this.loginService.getExample(code);
			this.isLoading = false;
			this.router.navigateByUrl('/home');
		}
		this.location.replaceState(this.location.path().split('?')[0], '');
	
	}
	async loginWith42(): Promise<void> {
		const url = 'https://api.intra.42.fr/oauth/authorize?client_id=54468a192544b06fef8e25a40d1e3d1febb65e21f600d6b57e1068e5aeba9823&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Flogin&response_type=code';
		window.location.href = url;
	}
	getCode(resp: any): string | undefined
	{
		return (resp._value.code);
	}
}
