import { Component, ElementRef, Input, OnInit, ViewChild  } from '@angular/core';
import { fromEvent } from 'rxjs';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { ChatI, SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { HomeService } from '../../home.service';
import { PlayService } from '../play/play.service';
import { eChat, eChatType, ePlay } from 'src/app/shared/ft_enums';
import { SystemInfoI } from 'src/app/shared/interface/iDash';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserProfileComponent } from '../chat/modal/user-profile/user-profile.component';
import { ChatService } from '../chat/chat.service';
import { DashboardService } from './dashboard.service';
import { StatusMessageI } from '../chat/modal/statusMsgI';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SocketService } from '../../socket.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
	@Input() dashboardPreference: SharedPreferencesI;
	@ViewChild('searchUsers', { static: true }) searchInput: ElementRef;
	@Input() public type: string;
	search: string;
	session = this.sQuery.getSessionToken();
	getRankingsEmitter: any;
	getInfoSystemEmitter:any;
	forceUpdateEmitter: any;
	ranking: UserPublicInfoI[] = [];
	infoSystem: SystemInfoI;
	searchResult: any[] = [];

	
	statusMsg: StatusMessageI = <StatusMessageI>{};
	
	constructor(private dashboardService: DashboardService,
		private modalService: NgbModal,
	 	private sQuery: SessionStorageQueryService,
	 	public homeService: HomeService,
	 	private playService: PlayService,
		private chatService: ChatService,
		private socketService: SocketService,
		private router: Router
	  ) {
			this.initVariables(true);
			
			this.infoSystem = <SystemInfoI>{};
			this.infoSystem.total_users = 0;
			this.infoSystem.in_game_users = 0;
			this.infoSystem.online_users = 0;
	  }
  
	ngOnInit() {
		this.forceUpdateEmitter = this.socketService.foreceUpdateEmitter.subscribe((data: any) => {
			this.playService.emit(ePlay.ON_GET_INFO_SYSTEM);
		});
		this.initSearchboxListener();
		this.getRankingsEmitter = this.playService.getRankingEmiter.subscribe((data: any) => {
			if (data !== undefined) {
				this.ranking = data;
			}		
		});
		this.getInfoSystemEmitter = this.playService.getInfoSystemEmitter.subscribe((data: any) =>{
			this.infoSystem = data;
		})
		this.playService.emit(ePlay.ON_GET_INFO_SYSTEM);
		this.showRanking();
	}
	ngOnDestroy(): void {
		this.getRankingsEmitter.unsubscribe();
		this.getInfoSystemEmitter.unsubscribe();
	}

	filterSearchResults(){
		if (this.type == 'member')
			this.searchResult = this.searchResult.filter(el => {
				return !this.dashboardPreference.chat.active_room.members.find((element : UserPublicInfoI) => {
				return element.login === el.login;
			});
		});
	}
	initSearchboxListener(){
		fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			map((event: any) => {
				return event.target.value;
			})		, debounceTime(100)
					, distinctUntilChanged()).subscribe((text: string) => {
					if (text.length <= 0)
						this.searchResult = [];
					else
					{
						this.onSearchBoxFriendChange(text).subscribe((res: any)=> {
							this.searchResult = res;
							this.searchResult = this.searchResult.filter(item => item.login != "nobody");
							this.filterSearchResults();
						}, (err: any) => {
							console.log('error', err);
						});
					}
						
		});
	}
	onSearchBoxFriendChange(value: any)
	{
		return (this.dashboardService.liveSearchUsers(this.session, value));
	}
	onSearchBoxChannelChange(value: any) {
		return (this.chatService.liveSearchRooms(this.session, value))
	}
	async onSubmitFriends(): Promise<void> {
		if (this.searchInput.nativeElement.value.length > 0)
			this.searchResult = await this.dashboardService.searchUsers(this.session, this.searchInput.nativeElement.value);
		else
		this.searchResult = await this.dashboardService.searchUsers(this.session, "%");
		this.searchResult = this.searchResult.filter(item => item.login != "nobody" && item.login != this.dashboardPreference.userInfo.login);
		this.filterSearchResults();
	}

	showRanking() {
		this.playService.emit(ePlay.ON_GET_RANKING);
	}

	startStatusMsgTimer(msgStatus: StatusMessageI)
	{
		this.statusMsg = msgStatus;
		var counter = 3;
		let intervalId = setInterval(() => {
			counter--;
			if (counter-- == 0)
			{
				this.statusMsg = <StatusMessageI>{};
				clearInterval(intervalId)
			}
		}, 1000)
	}

	openProfile(item : UserPublicInfoI){
		const modal = this.modalService.open(UserProfileComponent, {
			centered: false,
			animation: true,
			windowClass : "user-profile"
		  });
		  modal.componentInstance.user = item;
		  modal.componentInstance.preferences = this.dashboardPreference;
		  modal.componentInstance.passEntry.subscribe((receivedEntry: any) => {
		  });
	}
	isNotFriend(user: UserPublicInfoI): boolean{
		return (this.dashboardPreference.friends.find(usr => usr.login == user.login) == undefined);
	}
	startChat(user: UserPublicInfoI){
		//this.modal.dismiss();
		var chatInfo: ChatI = <ChatI>{};
		chatInfo.type = eChatType.DIRECT;
		this.chatService.emit(eChat.ON_START, {members: [user], chatInfo});
		this.router.navigateByUrl('/chat');
	}
	async addFriendShip(user: UserPublicInfoI): Promise<any>{
		const resp = await (this.dashboardService.addFriendShip(user, this.session));
		if (resp)
			this.startStatusMsgTimer(<StatusMessageI>{
				isError: false,
				message : "Friend invitation has been send"
			});
		//this.initVariables(true);
		return (resp);
	}
	
	playPong(user: any)
	{
		this.playService.emit(ePlay.ON_REQUEST_INVITATION, user)
		//this.initVariables(true);
	}
	private initVariables(dismiss: boolean){
		this.statusMsg = <StatusMessageI>{};
		this.search = '';
		
		if (dismiss)
			this.searchResult = [];
		//this.initSearchboxListener();
	}
}
