	import { Component, OnInit } from '@angular/core';
	import { Router } from '@angular/router';
	import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';
	import { UserStatus } from 'src/app/shared/enums/eUser';
	import { UserI } from 'src/app/shared/interface/user';
	import { HomeService } from './home.service';

	@Component({
		selector: 'app-home',
		templateUrl: './home.component.html',
		styleUrls: ['./home.component.css'],
	})

	export class HomeComponent implements OnInit {
		user: UserI = this.sQuery.getUser();
		isLoaded: boolean = false;
		constructor(
			private sQuery: LocalStorageQueryService,
			private router: Router,
			private homeService: HomeService
		) {}

		async ngOnInit(): Promise<void> {
			this.user = await this.homeService.getUserData();
			this.sQuery.setUser(this.user);
			if (this.user.status !== UserStatus.CONFIRMED)
				this.router.navigateByUrl('/auth');
			else 
				this.isLoaded = true;
			console.log(this.user);
		}

		logOut(): void {
			this.sQuery.removeUser();
			this.router.navigateByUrl('/auth');
			this.isLoaded = false;
		}

		updateToken(): void {
			console.log('Token updated!! -> ');
		}

		deleteAccount():void {
			this.homeService.deleteUserAccount();
			this.logOut();
		}
	}
