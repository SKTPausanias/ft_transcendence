<<<<<<< HEAD
import { Component, ElementRef, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
=======
import { Component, Type, ElementRef, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
>>>>>>> 2factor_jhf
import { Router } from '@angular/router';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbdModalConfirm } from './modal-logout.component'

@Component({
selector: 'app-left-nav',
templateUrl: './left-nav.component.html',
styleUrls: ['./left-nav.component.css'],
})
export class LeftNavComponent implements OnInit {
	@Output() newItemEvent = new EventEmitter<number>();
	@ViewChild('home_e') eHome: ElementRef<HTMLInputElement>;
	@ViewChild('play_e') ePlay: ElementRef<HTMLInputElement>;
	@ViewChild('live_e') eLive: ElementRef<HTMLInputElement>;
	@ViewChild('chat_e') eChat: ElementRef<HTMLInputElement>;
	@ViewChild('conf_e') eConf: ElementRef<HTMLInputElement>;
	@ViewChild('logout_e') eLogout: ElementRef<HTMLInputElement>;
<<<<<<< HEAD

	constructor(
		private sQuery: LocalStorageQueryService,
		private router: Router
	) {
	}

	ngOnInit(): void {
		
	}
	home(){
		this.newItemEvent.emit(0);
		this.router.navigateByUrl('');
		this.select_view(this.eHome);
		console.log("home selected");
	}

=======
	MODALS: {[name: string]: Type<any>} = {
		focusFirst: NgbdModalConfirm,
	};
	constructor(
		//private sQuery: LocalStorageQueryService,
		private router: Router,
		private modalService: NgbModal
	) {
	}

	ngOnInit(): void {
		
	}
	home(){
		this.newItemEvent.emit(0);
		this.router.navigateByUrl('');
		this.select_view(this.eHome);
		console.log("home selected");
	}

>>>>>>> 2factor_jhf
	play(){
		this.newItemEvent.emit(1);
		this.router.navigateByUrl('play');
		this.select_view(this.ePlay);
		console.log("play selected");
	}

	live(){
		this.newItemEvent.emit(2);
		this.router.navigateByUrl('live');
		this.select_view(this.eLive);
		console.log("live selected");
	}
	chat(){
		this.newItemEvent.emit(3);
		this.router.navigateByUrl('chat');
		this.select_view(this.eChat);
		console.log("chat selected");
	}
	conf(){
		this.newItemEvent.emit(4);
		this.router.navigateByUrl('settings');
		this.select_view(this.eConf);
		console.log("conf selected");
	}
<<<<<<< HEAD
	logOut(): void {
=======
	/*logOut(): void {
>>>>>>> 2factor_jhf
		this.select_view(this.eLogout);
		var answer = window.confirm('Are you realy want to log out?');
		if (answer) {
		this.sQuery.removeUser();
		this.router.navigateByUrl('/auth');
		} else {
			this.home();
		console.log('answer2: ', answer);
		}
<<<<<<< HEAD
	}
=======
	}*/

	open(name: string) {
		this.modalService.open(this.MODALS[name], { centered: true, animation: true });
	}

>>>>>>> 2factor_jhf
	select_view(sel: ElementRef<HTMLInputElement>){
		this.eHome.nativeElement.classList.remove("selected");
		this.ePlay.nativeElement.classList.remove("selected");
		this.eLive.nativeElement.classList.remove("selected");
		this.eChat.nativeElement.classList.remove("selected");
		this.eConf.nativeElement.classList.remove("selected");
		this.eLogout.nativeElement.classList.remove("selected");
		sel.nativeElement.classList.add("selected");
	}
}
