import { HttpClient } from '@angular/common/http';
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
  session = this.sQuery.getSessionToken();
  flag: boolean = false;
  constructor(private authService: AuthService,
				private sQuery: SessionStorageQueryService,
        private http: HttpClient,
    ){
  }
  async ngOnInit(): Promise<void> {
    await this.setNobody();
  }
  async setNobody(): Promise<void>{
    const url = 'api/users/nobody';
    await this.http.get<any>(url).toPromise();
  }

  /* @HostListener('window:unload', [ '$event' ])
  async unloadHandler(event: any) {
    if (this.sQuery !== undefined && this.sQuery.getSessionToken() !== undefined)
	    await this.authService.logout(this.sQuery.getSessionToken());
  } */
}
