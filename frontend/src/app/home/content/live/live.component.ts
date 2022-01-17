import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
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

	async ngOnInit(): Promise<void> {
		this.initLiveEventReciver();
		const response = await this.liveService.getLiveGames(this.session);
		if (response.statusCode == 200)
			this.games = response.data;
	}
	ngOnDestroy(): void {
		this.liveEventReciver.unsubscribe();
	}
	initLiveEventReciver(){
		this.liveEventReciver = this.liveService.liveEventEmitter.subscribe((data : any )=>{
			console.log("data from live service recived: ", data);
		})
	}

	startStreaming(game: WaitRoomI): void {
		this.isStreaming = true;
		this.streaming = game;
	}

	cancelStreaming(): void {
		this.isStreaming = false;
		this.streaming = <WaitRoomI>{};
	}
}
