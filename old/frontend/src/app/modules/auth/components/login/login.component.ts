import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserI } from 'src/app/shared/interface/user';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	user: UserI = this.sQuery.getUser();
	constructor(
		private sQuery: LocalStorageQueryService,
		private route: Router
	) { }

	ngOnInit(): void {
		if (this.user.online)
			this.route.navigateByUrl('/');

	}

	async login(): Promise<void> {
		const url = 'https://api.intra.42.fr/oauth/authorize?client_id=54468a192544b06fef8e25a40d1e3d1febb65e21f600d6b57e1068e5aeba9823&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Fauth&response_type=code';
		window.location.href = url;
	}
}
