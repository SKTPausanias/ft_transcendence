import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { ChatService } from './chat.service';
import { debounceTime, map, distinctUntilChanged, filter} from "rxjs/operators";
import { fromEvent } from 'rxjs';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
	@ViewChild('searchUsers', { static: true }) searchInput: ElementRef;

  users: UserPublicInfoI[];
  session = this.sQuery.getSessionToken();
  constructor(
    private chatService: ChatService,
    private sQuery: SessionStorageQueryService
    ) { }

  ngOnInit() {
	  this.initSearchboxListener();
  }

  async onSubmitFriends(val: any): Promise<void> {
    this.users = await this.chatService.searchUsers(this.session, val.searchUser);
  }

  initSearchboxListener(){
	var oldConsole = console.log;
	fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
		map((event: any) => {
		  return event.target.value;
		})	//, filter(res => res.length > 2)
  			, debounceTime(1000)
  			, distinctUntilChanged()).subscribe((text: string) => {

				console.log = function (){};
				if (text.length <= 2)
					this.users = [];
				else
					this.onSearchBoxChange(text).subscribe((res: any)=> {
						this.users = res;
					}, (err: any) => {
						console.log = oldConsole;
						console.log('error', err);
					});
				console.log = oldConsole;
	  });
  }
  onSearchBoxChange(value: any)
  {
	return (this.chatService.liveSearchUsers(this.session, value));
  }
}
