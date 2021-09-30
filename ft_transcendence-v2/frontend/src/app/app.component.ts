import { Component, HostListener } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { SessionStorageQueryService } from './shared/service/session-storage-query.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';
  constructor(private authService: AuthService,
				private sQuery: SessionStorageQueryService){
  }
  @HostListener('window:unload', [ '$event' ])
  async unloadHandler(event: any) {
	  await this.authService.logout(this.sQuery.getSessionToken());
  }
}
