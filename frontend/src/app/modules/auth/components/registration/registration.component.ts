import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserStatus } from 'src/app/shared/enums/eUser';
import { LocalStorageQueryService } from '../../../../shared/service/local-storage-query.service'

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  constructor(private sQuery: LocalStorageQueryService,
	private router: Router) { }

  ngOnInit(): void {
	console.log('OnInit: Confiirmation');

  }
  
  getRegistered(): void {
    this.sQuery.setStatus(UserStatus.UNCONFIRMED);
	this.router.navigateByUrl('/');
  }
}
