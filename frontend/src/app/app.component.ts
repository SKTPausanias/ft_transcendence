import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { SessionStorageService } from './shared/ft_services';
import { SessionStorageQueryService } from './shared/service/session-storage-query.service';
import { mDate } from './utils/date';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
  session = this.sQuery.getSessionToken();
  constructor(private authService: AuthService,
				private sQuery: SessionStorageQueryService,
				private router: Router){
  }
/*   @HostListener('window:unload', [ '$event' ])
  async unloadHandler(event: any) {
	  await this.authService.logout(this.sQuery.getSessionToken());
  } */
  @HostListener('window:keydown', [ '$event' ])
  async keydown(event: any) {
	 /*  this.session = this.sQuery.getSessionToken();
	  if (this.session !== undefined)
	  {
		  if (mDate.expired(this.session.expiration_time))
		  {
			  this.authService.logout(this.session);
			  this.sQuery.removeAll();
			  this.router.navigateByUrl('logIn');
		  }
		  else
			  this.sQuery.setSessionToken(this.session);
	  }
	  else 
	  console.log("keydown"); */
  }
  @HostListener('window:mousemove', [ '$event' ])
  async mousemove(event: any) {
	  /* this.session = this.sQuery.getSessionToken();
	  if (this.session !== undefined)
	  {
		  if (mDate.expired(this.session.expiration_time))
		  {
			  this.authService.logout(this.session);
			  this.sQuery.removeAll();
			  this.router.navigateByUrl('logIn');
		  }
		  else
			  this.sQuery.setSessionToken(this.session);
	  }
	  else 
	  console.log("mousemove"); */
  }
  
}
