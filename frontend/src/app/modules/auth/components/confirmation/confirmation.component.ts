import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserStatus } from 'src/app/shared/enums/eUser';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {

  constructor(private sQuery: LocalStorageQueryService,
				private router: Router) { }

  ngOnInit(): void {
	console.log('OnInit: Confirmation');
  }

  getConfirm(): void {
	this.sQuery.setStatus(UserStatus.CONFIRMED);
	this.router.navigateByUrl('/');
  }

}
