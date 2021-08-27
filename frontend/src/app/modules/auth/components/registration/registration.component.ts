	import { Component, OnInit } from '@angular/core';
	import { Router } from '@angular/router';
	import { UserStatus } from 'src/app/shared/enums/eUser';
	import { UserI } from 'src/app/shared/interface/user';
	import { LocalStorageQueryService } from '../../../../shared/service/local-storage-query.service';
import { AuthService } from '../../auth.service';

	@Component({
	selector: 'app-registration',
	templateUrl: './registration.component.html',
	styleUrls: ['./registration.component.css'],
	})
	export class RegistrationComponent implements OnInit {
	user: UserI = this.sQuery.getUser();
	constructor(
		private sQuery: LocalStorageQueryService,
		private router: Router,
		private authService: AuthService
	) {}

	ngOnInit(): void {
		console.log('OnInit: Registration');
	}

	async getRegistered(): Promise<void> {
		this.user = await this.authService.registerUser(this.user);
		this.sQuery.setUser(this.user);
		this.router.navigateByUrl('/');
	}
	}
