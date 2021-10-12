import { Component, ElementRef, OnInit, ViewChild  } from '@angular/core';

import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { ChatService } from '../info/info.service';
import { debounceTime, map, distinctUntilChanged, filter} from "rxjs/operators";
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {

	@ViewChild('searchUsers', { static: true }) searchInput: ElementRef;
	@ViewChild('friendship') frindInput : ElementRef;
  
	users: UserPublicInfoI[];
	session = this.sQuery.getSessionToken();
	constructor(
	  private chatService: ChatService,
	  private sQuery: SessionStorageQueryService
	  ) { }
  
	ngOnInit() {
		this.initSearchboxListener();
	}
  
	async onSubmitFriends(): Promise<void> {
	  this.users = await this.chatService.searchUsers(this.session, this.searchInput.nativeElement.value);
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
		return (this.chatService.liveSearchUsers(this.session, value));
	}
	async addFriendShip(user: any): Promise<any>{
	  console.log("val of user: ", user);
	  return (await this.chatService.addFriendShip(user, this.session))
	}
  
	async removeFriendShip(user: any): Promise<any>{
	  return (await this.chatService.removeFriendShip(user, this.session));
	}

}
