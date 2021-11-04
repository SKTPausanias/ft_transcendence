import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild  } from '@angular/core';

import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { DashboardService } from './dashboard.service';
import { debounceTime, map, distinctUntilChanged, filter} from "rxjs/operators";
import { fromEvent } from 'rxjs';
import { SharedPreferencesI } from 'src/app/shared/ft_interfaces';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
	@Input() dashboardPreference: SharedPreferencesI;
	@ViewChild('searchUsers', { static: true }) searchInput: ElementRef;
	@ViewChild('friendship') frindInput : ElementRef;
	@ViewChild('grpUsers') selectGroup: ElementRef<HTMLInputElement>; // object can be a basic object or specific type of HTML...
	@ViewChild('nChatElement') chatName: ElementRef<HTMLInputElement>;

	showUsers: boolean = false; //Values must be assigned in the constructor function...
	showSelect: boolean = false;
	grpUsers: UserPublicInfoI[]; //userPublicInfo

	users: UserPublicInfoI[];
	session = this.sQuery.getSessionToken();

	constructor(
	  private dashboardService: DashboardService,
	  private sQuery: SessionStorageQueryService
	  ) {
		  this.grpUsers = [];
	  }
  
	ngOnInit() {
		this.initSearchboxListener();
	}
	
	ngAfterViewInit() {
		this.grpUsers.push(this.dashboardPreference.userInfo);
		this.selectGroup.nativeElement.innerHTML += this.grpUsers[0].nickname + ": Owner\n";

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
				  if (text.length <= 0){
					  this.users = [];
					  this.showUsers = false;
				  }
				  else
					  this.onSearchBoxChange(text).subscribe((res: any)=> {
						  this.users = res;
						  this.showUsers = (this.users.length) ? true : false;
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

	addToGroup(user: any){
		this.selectGroup.nativeElement.removeAttribute("hidden");
		this.selectGroup.nativeElement.parentElement?.removeAttribute("hidden");
		if (!this.grpUsers.find(search => (search.nickname == user.nickname))) {
			this.grpUsers.push(user);
			this.selectGroup.nativeElement.innerHTML += user.nickname + "\n";
		}
		
	}

	async createGroupChat(): Promise<void>{
		if (this.chatName.nativeElement.value != "" && this.grpUsers.length > 1) {
			var obj = {
				chat_type: "group",
				members: this.grpUsers,
				chat_name: this.chatName.nativeElement.value
			}
			var ret = (await this.dashboardService.createGroupChat(this.session, obj));
			ret.statusCode != 200 ? alert(ret.data.error) : null;
			console.log(ret);
		}
		else
			console.log("Create a chatGroup is not possible", ret);
		this.clean();
	}

	clean(){
		this.showUsers = false;
		this.users = []
		this.grpUsers = [];
		this.grpUsers.push(this.dashboardPreference.userInfo);
		this.selectGroup.nativeElement.innerHTML = "";
		this.searchInput.nativeElement.value = "";
		this.chatName.nativeElement.value = "";
		this.selectGroup.nativeElement.innerHTML += this.grpUsers[0].nickname + " Owner\n";
		this.selectGroup.nativeElement.setAttribute("hidden","hidden");
		this.selectGroup.nativeElement.parentElement?.setAttribute("hidden","hidden");
		this.initSearchboxListener();
	}
}
