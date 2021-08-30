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
	constructor(
		private sQuery: LocalStorageQueryService,
		private router: Router,
		private route: ActivatedRoute,
		private authService: AuthService
	) {}

	async ngOnInit(): Promise<void> {	
		console.log(0);
		const queryParam = await this.route.queryParams;
		console.log(1);
		const code = this.getCode(queryParam);
		console.log(2);
		if (code !== undefined) {
			this.isLoading = true;
			this.user = await this.authService.getUserData(code);
			this.isLoading = false;
			this.sQuery.setUser(this.user);
		}
		if (this.user.status === undefined)
			this.router.navigateByUrl('auth/login');
		else if (this.user.status == UserStatus.UNREGISTERED)
			this.router.navigateByUrl('auth/registration');
		else if (this.user.status == UserStatus.UNCONFIRMED)
			this.router.navigateByUrl('auth/confirmation');
		else this.router.navigateByUrl('');
	}

	showLogin(): boolean {
		if (this.user.status === undefined) 
			return true;
		return false;
	}

	showRegister(): boolean {
		if (this.user.status == UserStatus.UNREGISTERED) 
			return true;
		return false;
	}

	showConfirm(): boolean {
		if (this.user.status == UserStatus.UNCONFIRMED) 
			return true;
		return false;
	}

	getCode(resp: any): string | undefined {
		if (resp._value.code !== undefined) return resp._value.code;
		else if (resp._value.error) return '401';
		return undefined;
	}
}
