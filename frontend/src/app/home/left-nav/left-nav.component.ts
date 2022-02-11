import { Component, Type, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Router, NavigationStart, Event, NavigationEnd, NavigationError } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { eChat, Nav } from 'src/app/shared/ft_enums'
import { SessionStorageQueryService } from 'src/app/shared/ft_services'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirm } from 'src/app/home/left-nav/logout-modal/logout-modal.component'
import { SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { ChatService } from '../content/chat/chat.service';

@Component({
selector: 'app-left-nav',
templateUrl: './left-nav.component.html',
styleUrls: ['./left-nav.component.css'],
})
export class LeftNavComponent implements OnInit {
	@Output() newItemEvent = new EventEmitter<string>();
	@Input() leftNavPreference: SharedPreferencesI;
	url: string;
	navL = Nav;
	MODALS: {[name: string]: Type<any>} = {
		focusFirst: NgbdModalConfirm,
	};
	unreadedMsgCount: number;
	selectSnd = new Audio("../../../assets/sounds/select.wav");
	constructor(
		private router: Router,
		private sQuery: SessionStorageQueryService,
		private authService: AuthService,
		private chatService: ChatService,
		private modalService: NgbModal)
		{
			this.selectSnd.volume = 0.1;
			this.router.events.subscribe((event: Event) => {
			if (event instanceof NavigationStart) {
				this.url = '/';
			}
			if (event instanceof NavigationEnd) {
				this.url = event.url.split('?')[0];
				this.newItemEvent.emit(this.url);
			}
			if (event instanceof NavigationError) {
				console.log(event.error);
			}
		});
	}

	ngOnInit(): void {
		this.chatService.emit(eChat.ON_GET_UNREAD_MSG);
		if (this.url === undefined)
			this.navigate(this.parseRouterUrl());
	}
	
	home(): void { this.selectSnd.play();this.navigate(Nav.HOME); }
	play(): void { this.selectSnd.play();this.navigate(Nav.PLAY); }
	live(): void { this.selectSnd.play();this.navigate(Nav.LIVE); }
	chat(): void { this.selectSnd.play();this.navigate(Nav.CHAT); }
	conf(): void { this.selectSnd.play();this.navigate(Nav.CONF); }
	async open(name: string) {
		var snd = new Audio("../../../assets/sounds/logout.wav");
		snd.volume = 0.1;
		snd.play();
		this.modalService.open(this.MODALS[name], { centered: true, animation: true });
	}
	parseRouterUrl(): string{
		const routerUrl = this.router.url;
		const pos = routerUrl.indexOf("?");
		this.url = routerUrl.substring(0, pos >=0 ? pos : routerUrl.length);
		return (this.url)
	}
	navigate(path: string){
		this.newItemEvent.emit(path);
		this.router.navigateByUrl(path);
	}
	mouseEnter(){
		/* var snd = new Audio("../../../assets/sounds/hover.wav");
		snd.volume = 0.05;
		snd.play(); */
	}

}
