import { HttpClient } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { PlayService } from './home/content/play/play.service';
import { ePlay, wSocket } from './shared/ft_enums';
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
				private router: Router,
        private http: HttpClient,
        private playService: PlayService){
  }
  async ngOnInit(): Promise<void> {
    console.log("Calling setNobody from appComponent on init");
    await this.setNobody();
  }
  async setNobody(): Promise<void>{
    const url = 'api/users/nobody';
    await this.http.get<any>(url).toPromise();
  }

/*   @HostListener('window:unload', [ '$event' ])
  async unloadHandler(event: any) {
    console.log("Calling unloadHandler from appComponent...", event);
    this.playService.emit(wSocket.ON_FORCE_UPDATE);
    if (this.sQuery !== undefined && this.sQuery.getSessionToken() !== undefined)
	    await this.authService.logout(this.sQuery.getSessionToken());
  } */
}
