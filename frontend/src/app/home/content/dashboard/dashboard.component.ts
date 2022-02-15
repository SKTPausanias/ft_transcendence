import { Component, ElementRef, Input, OnInit, ViewChild  } from '@angular/core';

import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { HomeService } from '../../home.service';
import { PlayService } from '../play/play.service';
import { ePlay } from 'src/app/shared/ft_enums';
import { SystemInfoI } from 'src/app/shared/interface/iDash';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
	@Input() dashboardPreference: SharedPreferencesI;
	session = this.sQuery.getSessionToken();
	getRankingsEmitter: any;
	getInfoSystemEmitter:any;
	ranking: UserPublicInfoI[] = [];
	infoSystem: SystemInfoI;
	
	constructor(
	  private sQuery: SessionStorageQueryService,
	  public homeService: HomeService,
	  private playService: PlayService,
	  ) {
		  this.infoSystem = <SystemInfoI>{};
		  this.infoSystem.total_users = 0;
		  this.infoSystem.in_game_users = 0;
		  this.infoSystem.online_users = 0;
	  }
  
	ngOnInit() {
		this.getRankingsEmitter = this.playService.getRankingEmiter.subscribe((data: any) => {
			if (data !== undefined) {
				this.ranking = data;
			}		
		});
		this.getInfoSystemEmitter = this.playService.getInfoSystemEmitter.subscribe((data: any) =>{
			console.log("DashBoard infoSystem was called");
			this.infoSystem = data;
		})
		this.playService.emit(ePlay.ON_GET_INFO_SYSTEM);
		this.showRanking();
	}
	ngOnDestroy(): void {
		this.getRankingsEmitter.unsubscribe();
		this.getInfoSystemEmitter.unsubscribe();
	}

	showRanking() {
		this.playService.emit(ePlay.ON_GET_RANKING);
	}
}
