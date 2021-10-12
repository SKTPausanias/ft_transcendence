import { Component, ElementRef, OnInit, ViewChild  } from '@angular/core';

import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { DashboardService } from './dashboard.service';
import { debounceTime, map, distinctUntilChanged, filter} from "rxjs/operators";
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

	@ViewChild('searchUsers', { static: true }) searchInput: ElementRef;
	@ViewChild('friendship') frindInput : ElementRef;
  
	users: UserPublicInfoI[];
	session = this.sQuery.getSessionToken();
	constructor(
	  private dashboardService: DashboardService,
	  private sQuery: SessionStorageQueryService
	  ) { }
  
	ngOnInit() {
		this.initSearchboxListener();
	}
  
	async onSubmitFriends(): Promise<void> {
	  this.users = await this.dashboardService.searchUsers(this.session, this.searchInput.nativeElement.value);
	}
  
	initSearchboxListener(){
	  fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
		  map((event: any) => {
			return event.target.value;
		  })	//, filter(res => res.length > 2)
				, debounceTime(1000)
				, distinctUntilChanged()).subscribe((text: string) => {
				  if (text.length <= 2)
					  this.users = [];
				  else
					  this.onSearchBoxChange(text).subscribe((res: any)=> {
						  this.users = res;
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
	  console.log("val of user: ", user);
	  return (await this.dashboardService.addFriendShip(user, this.session))
	}
  
	async removeFriendShip(user: any): Promise<any>{
	  return (await this.dashboardService.removeFriendShip(user, this.session));
	}
}
