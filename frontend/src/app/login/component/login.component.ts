import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LoginService } from '../service/login.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})


export class LoginComponent implements OnInit {

	url: string = 'https://api.intra.42.fr/oauth/authorize?client_id=54468a192544b06fef8e25a40d1e3d1febb65e21f600d6b57e1068e5aeba9823&redirect_uri=http%3A%2F%2Flocalhost%3A4200&response_type=code';
  	constructor(@Inject(DOCUMENT) private document: Document, private location:Location, private route: ActivatedRoute, private loginService: LoginService) { }

	ngOnInit(): void {
		this.route.queryParams
		.subscribe(params => {
			if (params.code !== undefined)
				this.loginService.getExample(params.code);
			if (params.error !== undefined || params.code !== undefined)
				this.location.replaceState(this.location.path().split('?')[0], '');
		});
	}
	loginWith42(): void {
		(this.document.location.href = this.url);
	}
}
