import { Component, OnInit, Input, ViewChild, ElementRef } from "@angular/core";
import { ePlay } from "src/app/shared/ft_enums";
import { SharedPreferencesI, WaitRoomI } from "src/app/shared/ft_interfaces";
import { SessionStorageQueryService } from "src/app/shared/ft_services";
import { LiveService } from "./live.service";
import { Location } from '@angular/common';

@Component({
	selector: "app-live",
	templateUrl: "./live.component.html",
	styleUrls: ["./live.component.css"],
})
export class LiveComponent implements OnInit {  
	@ViewChild('live_watch') liveCanvas: ElementRef<HTMLCanvasElement>;
	@Input() livePreference: SharedPreferencesI;
	
	liveEventReciver: any;
	session = this.sQuery.getSessionToken();
	games: WaitRoomI[] = [];
	isStreaming: boolean = false;
	streaming: WaitRoomI = <WaitRoomI>{};

	constructor(private liveService: LiveService,
		private location: Location,
		private sQuery: SessionStorageQueryService) {}

	ngOnInit(): void {
		this.initLiveEventReciver();
		this.liveService.emit(ePlay.ON_GET_LIVE_GAMES);
		this.location.replaceState(this.location.path().split('?')[0], '');
	}

	ngOnDestroy(): void {
		this.liveEventReciver.unsubscribe();
	}
   
  	initLiveEventReciver(){
		this.liveEventReciver = this.liveService.liveEventEmitter.subscribe((data : any )=>{
			if (data.games.lives)
				this.games = data.games.lives;
			if (this.games.find(item => item.id == this.streaming.id) == undefined)
			{
				this.isStreaming = false;
				this.streaming = <WaitRoomI>{};
			}
			if (data.games.delView)
			this.games.forEach(element => {
				this.liveService.emit(ePlay.ON_STOP_STREAM, element);
			});
		});
	}

	startStreaming(game: WaitRoomI): void {
		this.isStreaming = true;
		this.streaming = game;
	}

	rcvEvent(val: boolean){
		if (val)
			this.isStreaming = false;
		this.liveService.emit(ePlay.ON_GET_LIVE_GAMES);
	}
}
