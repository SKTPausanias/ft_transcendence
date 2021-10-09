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
  flag: boolean = false;
  constructor(private authService: AuthService,
				private sQuery: SessionStorageQueryService,
				private router: Router){
  }
/*   @HostListener('window:unload', [ '$event' ])
  async unloadHandler(event: any) {
	  await this.authService.logout(this.sQuery.getSessionToken());
  } */
}
