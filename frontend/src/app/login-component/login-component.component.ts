import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login-component',
  templateUrl: './login-component.component.html',
  styleUrls: ['./login-component.component.css']
})


export class LoginComponentComponent implements OnInit {


	url: string = 'https://api.intra.42.fr/oauth/authorize?client_id=54468a192544b06fef8e25a40d1e3d1febb65e21f600d6b57e1068e5aeba9823&redirect_uri=http%3A%2F%2Flocalhost%3A4200&response_type=code';
  	constructor(@Inject(DOCUMENT) private document: Document, private route: ActivatedRoute) { }

	ngOnInit(): void {
		this.route.queryParams
		.subscribe(params => {
			if (params.code !== undefined)
				this.getUser(params.code);
		});
	}
	loginWith42(): void {
		(this.document.location.href = this.url);
		console.log("btn pressed");
	}
	getUser(code: string)
	{
		console.log("making api call to backend with: " + code);
	}

}
