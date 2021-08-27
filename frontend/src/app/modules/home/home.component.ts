import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';
import { UserStatus } from 'src/app/shared/enums/eUser';
import { UserI } from 'src/app/shared/interface/user';

@Component({
selector: 'app-home',
templateUrl: './home.component.html',
styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
	
	user: UserI = <UserI>{};
	constructor(
		private sQuery: LocalStorageQueryService,
		private router: Router
	) {}

ngOnInit(): void {
	this.user =  this.sQuery.getUser();
	console.log('OnInit: Home -> ', this.sQuery.getUser().status);
	if (this.user.status !== UserStatus.CONFIRMED)
		this.router.navigateByUrl('/auth');
}
logOut(): void {
	this.sQuery.removeUser();
	this.ngOnInit();
}

updateToken(): void {
	console.log('Token updated!! -> ');
}
}