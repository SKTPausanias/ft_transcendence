import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { ePlay } from "src/app/shared/ft_enums";
import { SharedPreferencesI, WaitRoomI } from "src/app/shared/ft_interfaces";
import { SessionStorageQueryService } from "src/app/shared/ft_services";
import { LiveService } from "./live.service";

@Component({
	selector: "app-live",
	templateUrl: "./live.component.html",
	styleUrls: ["./live.component.css"],
})
export class LiveComponent implements OnInit {
	@Input() livePreference: SharedPreferencesI;
	liveEventReciver: any;
	session = this.sQuery.getSessionToken();
	games: WaitRoomI[] = [];
	isStreaming: boolean = false;
	streaming: WaitRoomI = <WaitRoomI>{};

	constructor(private liveService: LiveService,
				private router: Router,
				private sQuery: SessionStorageQueryService) {}

	ngOnInit(): void {
		this.initLiveEventReciver();
		this.liveService.emit(ePlay.ON_GET_LIVE_GAMES);
	/* 	const response = await this.liveService.getLiveGames(this.session);
		if (response.statusCode == 200)
			this.games = response.data; */
	}
	ngOnDestroy(): void {
		this.cancelStreaming();
		this.liveEventReciver.unsubscribe();
	}
	initLiveEventReciver(){
		this.liveEventReciver = this.liveService.liveEventEmitter.subscribe((data : any )=>{
			console.log("data from live service recived: ", data);
			if (data.games)
				this.games = data.games;
			if (this.games.find(item => item.id == this.streaming.id) == undefined)
			{
				this.isStreaming = false;
				this.streaming = <WaitRoomI>{};
			}
		})
	}

	startStreaming(game: WaitRoomI): void {
		this.isStreaming = true;
		this.streaming = game;
		this.liveService.emit(ePlay.ON_START_STREAM, game);
	}

	cancelStreaming(): void {
		this.liveService.emit(ePlay.ON_STOP_STREAM, this.streaming);
		this.isStreaming = false;
		this.streaming = <WaitRoomI>{};
	}
}
