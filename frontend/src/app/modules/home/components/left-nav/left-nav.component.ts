import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';

@Component({
selector: 'app-left-nav',
templateUrl: './left-nav.component.html',
styleUrls: ['./left-nav.component.css'],
})
export class LeftNavComponent implements OnInit {
	@ViewChild('home_e') eHome: ElementRef<HTMLInputElement>;
	@ViewChild('play_e') ePlay: ElementRef<HTMLInputElement>;
	@ViewChild('live_e') eLive: ElementRef<HTMLInputElement>;
	@ViewChild('conf_e') eConf: ElementRef<HTMLInputElement>;
	@ViewChild('logout_e') eLogout: ElementRef<HTMLInputElement>;

	constructor(
		private sQuery: LocalStorageQueryService,
		private router: Router
	) {
	}

	ngOnInit(): void {
	}
	home(){
		this.select_view(this.eHome);
		console.log("home selected");
	}

	play(){
		this.select_view(this.ePlay);
		console.log("play selected");
	}

	live(){
		this.select_view(this.eLive);
		console.log("live selected");
	}

	conf(){
		this.select_view(this.eConf);
		console.log("conf selected");
	}
	logOut(): void {
		this.select_view(this.eLogout);
		var answer = window.confirm('Are you realy want to log out?');
		if (answer) {
		this.sQuery.removeUser();
		this.router.navigateByUrl('/auth');
		} else {
			this.home();
		console.log('answer2: ', answer);
		}
	}
	select_view(sel: ElementRef<HTMLInputElement>){
		this.eHome.nativeElement.classList.remove("selected");
		this.ePlay.nativeElement.classList.remove("selected");
		this.eLive.nativeElement.classList.remove("selected");
		this.eConf.nativeElement.classList.remove("selected");
		this.eLogout.nativeElement.classList.remove("selected");
		sel.nativeElement.classList.add("selected");
	}
}
