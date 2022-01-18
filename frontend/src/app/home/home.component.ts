import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SessionStorageQueryService } from 'src/app/shared/ft_services'
import { ePlay } from '../shared/ft_enums';
import { WaitRoomI } from '../shared/ft_interfaces';
import { SharedPreferencesI } from '../shared/interface/iSharedPreferences';
import { UserInfoI, UserPublicInfoI } from '../shared/interface/iUserInfo';
import { ChatService } from './content/chat/chat.service';
import { GameWaitRoomComponent } from './content/play/game-wait-room/game-wait-room.component';
import { PlayService } from './content/play/play.service';
import { HomeService } from './home.service';
import { SocketService } from './socket.service';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
	session = this.sQuery.getSessionToken();
	_path: string = '/';
	isLoaded = false;
	sharedPreference: SharedPreferencesI = <SharedPreferencesI>{};
	friendsOnline: any = [];
	socketEmiter: any;
	chatEmiter: any;
	playEmiter: any;
	waitRoomStatus: WaitRoomI = <WaitRoomI>{};
	modal: any;
	constructor(
	private router: Router,
	private sQuery: SessionStorageQueryService,
	private homeService: HomeService,
	private socketService: SocketService,
	private chatService: ChatService,
	private playService: PlayService,
    private modalService: NgbModal
	) {
		this.sharedPreference.userInfo = <UserInfoI>{};
		this.sharedPreference.friends = [];
		this.sharedPreference.expandRightNav = false;
		this.sharedPreference.friend_invitation = [];
		this.sharedPreference.game_invitation = [];
		this.sharedPreference.in_game = false;
		this.sharedPreference.chat = {
			active_room: undefined,
			rooms: []
		};
	}

	async ngOnInit(): Promise<void> {
		this.isLoaded = false;
		if (this.session === undefined) 
		{
			await this.homeService.terminateWorker();
			this.router.navigateByUrl('logIn');
		}
		else
		{
			//const ret = await this.homeService.loadPreferences();
			//if (ret.statusCode == 200)
			//this.sharedPreferences = ret.prefernces;
			this.homeService.listenSessionWorker();
			this.socketService.connect(this.session, this.sharedPreference);
			this.subscribeToSocketEmiter();
			this.subscribeToChatEmiter();
			this.subscribeToPlayEmiter();
		}
	}
	ngOnDestroy() {
		try {
			this.socketEmiter.unsubscribe();
			this.chatEmiter.unsubscribe();
			this.playEmiter.unsubscribe();
		} catch (error) {
			
		}
	  }
	setFragment(ev: any) {
		const tmpUrl = this.router.url;
		const pos = ev.indexOf("?");
		this._path = tmpUrl.substring(0, pos >= 0 ? pos : ev.length);
		this.sharedPreference.path = this._path;
	}
	mouseEnter(){
		this.sharedPreference.expandRightNav = true;
	}
	
	mouseLeave(){
		this.sharedPreference.expandRightNav = false;
	}
	private subscribeToSocketEmiter(){
		this.socketEmiter = this.socketService.socketEmiter.subscribe((data : any)=> {
			this.sharedPreference.userInfo = data.userInfo;
			this.sharedPreference.friends = data.friends;
			this.sharedPreference.friend_invitation = data.friend_invitation;
			this.isLoaded = true;
		})
	}
	private subscribeToChatEmiter(){
		this.socketEmiter = this.chatService.chatPreferenceEmiter.subscribe((data : any)=> {
			if (data.chat != undefined)
				this.sharedPreference.chat = data.chat;
			else if (data.rooms != undefined)
				this.sharedPreference.chat.rooms = data.rooms;
			else if (data.unreaded != undefined)
				this.sharedPreference.unreaded_messages = data.unreaded;

		/* 	console.log("DATA: ", data);
			var activeRoom = this.sharedPreference.chat.active_room;
			console.log("SP: ", this.sharedPreference.chat);
			if (activeRoom != undefined)
				this.sharedPreference.chat.active_room = data.rooms.find((item: any) => item.id == activeRoom.id);
			this.sharedPreference.chat.rooms = data.rooms; */

		});
	}

	private subscribeToPlayEmiter(): void {
		var invitations = this.sharedPreference.game_invitation;
		this.playService.emit(ePlay.ON_LOAD_ACTIVE_WAIT_ROOM);
		this.playEmiter = this.playService.playEmiter.subscribe((data: any) => {
			console.log("Data subscribed on playEmiter function!!!: ", data);
			if (data.invitation !== undefined)
				this.sharedPreference.game_invitation.push(data.invitation);
			else if (data.declination !== undefined){
				this.sharedPreference.game_invitation = invitations.filter(item => 
											(item.login != data.declination.login));
			}
			else if (data.acceptation !== undefined){
				this.sharedPreference.game_invitation = invitations.filter(item => 
					(item.nickname != data.acceptation.player1.nickname));
				this.sharedPreference.game = data.acceptation;
				if (data.acceptation.ready)
					this.router.navigateByUrl('/play')
				else
					this.openGameWaitRoom(data.acceptation);	
			}
			else if (data.allInvitations !== undefined)
				this.sharedPreference.game_invitation = data.allInvitations;
			else if (data.waitRoomStatus !== undefined)
				this.sharedPreference.game = data.waitRoomStatus;
			if (this.sharedPreference.game != undefined && this.sharedPreference.game.ready)
				this.sharedPreference.in_game = true;
			else
				this.sharedPreference.in_game = false;
		});
	}

	private openGameWaitRoom(waitRoom: WaitRoomI)
	{
		this.waitRoomStatus = waitRoom;
		console.log("Data acceptation from home component: ", waitRoom);
		this.modal = this.modalService.open(GameWaitRoomComponent, {
			centered: false,
			animation: true,
			backdrop: false,
			windowClass : "game-wait-room",
			keyboard  : false
		  });
		this.modal.componentInstance.waitRoom = waitRoom;
		this.modal.componentInstance.me = this.sharedPreference.userInfo;
		this.modal.componentInstance.waitRoomEntry.subscribe((reload: any) => {
			this.modal.componentInstance.waitRoom = this.sharedPreference.game;
		});
	}

	closeGameWaitRoom(){
		this.modal.dismiss();
	}

	@HostListener('window:keydown', [ '$event' ])
	async keydown(event: any) {
		await this.homeService.listenActivity();
	}
	
	@HostListener('window:mousemove', [ '$event' ])
	async mousemove(event: any) {
		await this.homeService.listenActivity();
	}
}
