import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserStatus } from 'src/app/shared/enums/eUser';
import { UserI } from 'src/app/shared/interface/user';
import { LocalStorageQueryService } from '../../shared/service/local-storage-query.service';
import { AuthService } from './auth.service';

@Component({
selector: 'app-auth',
templateUrl: './auth.component.html',
styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
	user: UserI = this.sQuery.getUser();
	isLoading: boolean = false;
	isLoaded: boolean = false;
	constructor(
		private sQuery: LocalStorageQueryService,
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthService
	) {}

	async ngOnInit(): Promise<void> {
		this.isLoaded = false;
		this.user = await this.authService.getUser();
		const queryParam = await this.route.queryParams;
		
		await this.queryAction(queryParam);
		if (this.user.status === undefined) 
			this.router.navigateByUrl('auth/login');
		else if (this.user.status == UserStatus.UNREGISTERED)
			this.router.navigateByUrl('auth/registration');
		else if (this.user.status == UserStatus.UNCONFIRMED)
			this.router.navigateByUrl('auth/confirmation');
		else 
			this.router.navigateByUrl('');
		this.isLoaded = true;
	}

	async queryAction(resp: any) {
		if (resp._value.code !== undefined) 
			await this.authUser(resp._value.code);
		else if (resp._value.uuid) 
			await this.confirmUser(resp._value.uuid);
		else if (resp._value.error) 
			console.log('401');
		else
			console.log("there is no query action");
	}

	async authUser(code: string) {
		this.isLoading = true;
		this.user = await this.authService.getUserData(code);
		this.isLoading = false;
		this.sQuery.setUser(this.user);
	}
	async confirmUser(uuid: string) {
		this.isLoading = true;
		this.user = await this.authService.confirmUser(uuid);
		this.isLoading = false;
		this.sQuery.setUser(this.user);
		this.router.navigateByUrl('/');
	}

	showLogin(): boolean {
		return (this.user.status === undefined ? true : false);
	}

	showRegister(): boolean {
		return (this.user.status == UserStatus.UNREGISTERED ? true : false);
	}

	showConfirm(): boolean {
		return (this.user.status == UserStatus.UNCONFIRMED ? true : false);
	}
}
