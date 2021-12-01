import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageQueryService } from 'src/app/shared/ft_services'
import { SharedPreferencesI } from '../shared/interface/iSharedPreferences';
import { UserInfoI } from '../shared/interface/iUserInfo';
import { ChatService } from './content/chat/chat.service';
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
	constructor(
	private router: Router,
	private sQuery: SessionStorageQueryService,
	private homeService: HomeService,
	private socketService: SocketService,
	private chatService: ChatService
	) {
		this.sharedPreference.userInfo = <UserInfoI>{};
		this.sharedPreference.friends = [];
		this.sharedPreference.expandRightNav = false;
		this.sharedPreference.friend_invitation = [];
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
		}
	}
	ngOnDestroy() {
		try {
			this.socketEmiter.unsubscribe();
			this.chatEmiter.unsubscribe();
		} catch (error) {
			
		}
	  }
	setFragment(ev: any) {
		const tmpUrl = this.router.url;
		const pos = ev.indexOf("?");
		this._path = tmpUrl.substring(0, pos >= 0 ? pos : ev.length);
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
			else if (data.messages != undefined)
				console.log("this is unread");

		/* 	console.log("DATA: ", data);
			var activeRoom = this.sharedPreference.chat.active_room;
			console.log("SP: ", this.sharedPreference.chat);
			if (activeRoom != undefined)
				this.sharedPreference.chat.active_room = data.rooms.find((item: any) => item.id == activeRoom.id);
			this.sharedPreference.chat.rooms = data.rooms; */

		});
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
