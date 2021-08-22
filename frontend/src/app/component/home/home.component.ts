import { Component, OnInit } from '@angular/core';
import { AppComponent } from "../../app.component"
import { Router } from '@angular/router';
import { UserI } from '../../model/interface/user'
import { LocalStorageService } from 'src/app/service/local-storage/local-storage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	user: UserI = <UserI>{};
  constructor(
	  private appComponent: AppComponent,
	  private router: Router,
	) {}

  async ngOnInit(): Promise<void> {
	if (!this.appComponent.hasToken())
		await this.router.navigateByUrl('/login');
	else
		this.user = this.appComponent.getUser();
  }
  logOut(): void {
	this.appComponent.logoutUser();
	this.ngOnInit();
  }

}
