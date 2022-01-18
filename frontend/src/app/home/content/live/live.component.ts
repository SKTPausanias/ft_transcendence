import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
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
	@Input() livePreference: SharedPreferencesI;
	liveEventReciver: any;
	session = this.sQuery.getSessionToken();
	games: WaitRoomI[] = [];
	isStreaming: boolean = false;
	streaming: WaitRoomI = <WaitRoomI>{};
	gameId: any;

	constructor(private liveService: LiveService,
				private router: Router,
				private location: Location,
				private sQuery: SessionStorageQueryService) {
				//console.log(" params: ", this.router.parseUrl(this.router.url).queryParams);
				}

	ngOnInit(): void {
		this.initLiveEventReciver();
		this.liveService.emit(ePlay.ON_GET_LIVE_GAMES);
		this.gameId = this.router.parseUrl(this.router.url).queryParams.game_id;
		this.location.replaceState(this.location.path().split('?')[0], '');
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
			if (data.games)
				this.games = data.games;
			else if (data.stream)
				this.startStreaming(data.stream);

			if (this.games.find(item => item.id == this.streaming.id) == undefined)
			{
				this.isStreaming = false;
				this.streaming = <WaitRoomI>{};
			}
			var game = this.games.find(item => item.id == Number(this.gameId));
			if (game != undefined)
				this.startStreaming(game);
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
