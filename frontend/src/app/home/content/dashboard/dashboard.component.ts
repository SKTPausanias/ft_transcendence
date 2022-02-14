import { Component, ElementRef, Input, OnInit, ViewChild  } from '@angular/core';

import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { DashboardService } from './dashboard.service';
import { debounceTime, map, distinctUntilChanged, filter} from "rxjs/operators";
import { fromEvent } from 'rxjs';
import { SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { HomeService } from '../../home.service';
import { Router } from '@angular/router';
import { taggedTemplate } from '@angular/compiler/src/output/output_ast';
import { PlayService } from '../play/play.service';
import { ePlay } from 'src/app/shared/ft_enums';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
	@Input() dashboardPreference: SharedPreferencesI;
	session = this.sQuery.getSessionToken();
	getRankingsEmiter: any;
	ranking: UserPublicInfoI[] = [];
	
	constructor(
	  private sQuery: SessionStorageQueryService,
	  public homeService: HomeService,
	  private playService: PlayService,
	  ) { }
  
	ngOnInit() {
		this.getRankingsEmiter = this.playService.getRankingEmiter.subscribe((data: any) => {
			if (data !== undefined) {
				this.ranking = data;
			}		
		});
		this.showRanking();
	}

	showRanking() {
		this.playService.emit(ePlay.ON_GET_RANKING);
	}
}
