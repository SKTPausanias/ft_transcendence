import { Component, OnInit, Input, ViewChild, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import { ePlay } from "src/app/shared/ft_enums";
import { SharedPreferencesI, WaitRoomI } from "src/app/shared/ft_interfaces";
import { SessionStorageQueryService } from "src/app/shared/ft_services";
import { LiveService } from "./live.service";
import { Location } from '@angular/common';
import { PlayService } from "../play/play.service";
import { BallI, PadI } from "src/app/shared/interface/iPlay";

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
	streamInterval: any;
	animationFrame: any;
	
	context: CanvasRenderingContext2D | null;
	ball: BallI;
	pad_1: PadI;
	pad_2: PadI;
	width: number;
	height: number;
	//gameId: number;

	constructor(private liveService: LiveService,
				//private router: Router,
				private location: Location,
				private sQuery: SessionStorageQueryService,
				private playService: PlayService) {
				
				this.width = 0;
				this.height = 0;
				}

	ngOnInit(): void {
		this.width = 0;
		this.height = 0;
		this.initLiveEventReciver();
		this.liveService.emit(ePlay.ON_GET_LIVE_GAMES);
		//this.gameId = this.router.parseUrl(this.router.url).queryParams.game_id;
		this.location.replaceState(this.location.path().split('?')[0], '');
	}

	ngAfterViewInit(){}

	ngOnDestroy(): void {
		//this.cancelStreaming();
		this.liveEventReciver.unsubscribe();
	}
	
    //renders every frame cleaning and drawing the elements
   /*  renderFrame(): void {
		this.context?.clearRect(0, 0, this.liveCanvas.nativeElement.width, this.liveCanvas.nativeElement.height);
		this.context?.fillRect(this.ball.pos_x, this.ball.pos_y, this.ball.width, this.ball.height);
		this.context?.fillRect(this.pad_1.pos_x, this.pad_1.pos_y, this.pad_1.width, this.pad_1.height);
		this.context?.fillRect(this.pad_2.pos_x, this.pad_2.pos_y, this.pad_2.width, this.pad_2.height);
		this.animationFrame = window.requestAnimationFrame(() => {
			this.renderFrame()
		});
   } */
   
   initLiveEventReciver(){
		this.liveEventReciver = this.liveService.liveEventEmitter.subscribe((data : any )=>{
			if (data.games)
				this.games = data.games;
			if (this.games.find(item => item.id == this.streaming.id) == undefined)
			{
				this.isStreaming = false;
				this.streaming = <WaitRoomI>{};
			}
		});
	}

	startStreaming(game: WaitRoomI): void {
		this.isStreaming = true;
		this.streaming = game;
	}

	rcvEvent(val: boolean){
		console.log("Called from canvas component...");
		if (val)
			this.isStreaming = false;
	}

	/* cancelStreaming(): void {
		this.liveService.emit(ePlay.ON_STOP_STREAM, this.streaming);
		this.isStreaming = false;
		this.streaming = <WaitRoomI>{};
		clearInterval(this.streamInterval);
		window.cancelAnimationFrame(this.animationFrame);
		this.context?.clearRect(0, 0, this.liveCanvas.nativeElement.width, this.liveCanvas.nativeElement.height);
	} */
}
