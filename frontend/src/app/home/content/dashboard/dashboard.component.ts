import { Component, ElementRef, Input, OnInit, ViewChild  } from '@angular/core';

import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { DashboardService } from './dashboard.service';
import { debounceTime, map, distinctUntilChanged, filter} from "rxjs/operators";
import { fromEvent } from 'rxjs';
import { SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { HomeService } from '../../home.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
	@Input() dashboardPreference: SharedPreferencesI;
	@ViewChild('searchUsers', { static: true }) searchInput: ElementRef;
	@ViewChild('friendship') friendInput : ElementRef;
  
	users: UserPublicInfoI[];
	session = this.sQuery.getSessionToken();
	fInvitation = [
		{ nickname: "dbelinsk"},
		{ nickname: "pepe"},
		{ nickname: "juan"},
		{ nickname: "carlos"}
	]
	constructor(
	  private dashboardService: DashboardService,
	  private sQuery: SessionStorageQueryService,
	  public homeService: HomeService
	  ) { }
  
	ngOnInit() {
		this.initSearchboxListener();
	}
  
	async onSubmitFriends(): Promise<void> {
	  this.users = (await this.dashboardService.searchUsers(this.session, this.searchInput.nativeElement.value));
	  this.users = this.users.filter(item => item.login != "nobody");
	  console.log("Users found From dashboard: ", this.users);
	}
  
	initSearchboxListener(){
	  fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
		  map((event: any) => {
			return event.target.value;
		  })	//, filter(res => res.length > 2)
				, debounceTime(1000)
				, distinctUntilChanged()).subscribe((text: string) => {
				  if (text.length <= 0)
					  this.users = [];
				  else
					  this.onSearchBoxChange(text).subscribe((res: any)=> {
						  this.users = res;
						  this.users = this.users.filter(item => item.login != "nobody");
					  }, (err: any) => {
						  console.log('error', err);
					  });
		});
	}
	
	onSearchBoxChange(value: any)
	{
		return (this.dashboardService.liveSearchUsers(this.session, value));
	}
	async addFriendShip(user: any): Promise<any>{
	  return (await this.dashboardService.addFriendShip(user, this.session))
	}
  
	async removeFriendShip(user: any): Promise<any>{
	  return (await this.dashboardService.removeFriendShip(user, this.session));
	}
}
