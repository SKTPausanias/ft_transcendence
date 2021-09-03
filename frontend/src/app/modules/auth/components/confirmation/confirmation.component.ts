	import { Component, OnInit } from '@angular/core';
	import { Router } from '@angular/router';
	import { UserI } from 'src/app/shared/interface/user';
	import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';
	import { AuthService } from '../../auth.service';

	@Component({
	selector: 'app-confirmation',
	templateUrl: './confirmation.component.html',
	styleUrls: ['./confirmation.component.css'],
	})
	export class ConfirmationComponent implements OnInit {
	user: UserI = this.sQuery.getUser();
	constructor(
		private sQuery: LocalStorageQueryService,
		private router: Router,
		private authService: AuthService
	) {}

		ngOnInit(): void {
		console.log('OnInit: Confirmation');
	}

	async getConfirm(): Promise<void> {
		this.user = await this.authService.confirmUser(this.user);
		//this.user = await this.authService.getUserData(this.sQuery.getUser().id);
		console.log("User at confirmation component: ", this.user);
		this.sQuery.setUser(this.user);
		this.router.navigateByUrl('/');
	}
	}
