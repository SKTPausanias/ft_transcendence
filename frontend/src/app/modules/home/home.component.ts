import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';
import { UserStatus } from 'src/app/shared/enums/eUser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	constructor(private query : LocalStorageQueryService, private router : Router) {
	}

	ngOnInit(): void {
		console.log('OnInit: Home');
		if (this.query.getStatus() !== UserStatus.CONFIRMED)
		this.router.navigateByUrl('/auth');
	}
	clearCache(): void{
		this.query.removeStatus();
		this.ngOnInit();
  }
}
