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
	gameId: any;
	
	context: CanvasRenderingContext2D | null;

	ball: BallI;
	pad_1: PadI;
	pad_2: PadI;
	width: number;
	height: number;

	renderInited: boolean;
	streamInterval: any;
	animationFrame: any;

	constructor(private liveService: LiveService,
				private router: Router,
				private location: Location,
				private sQuery: SessionStorageQueryService,
				private playService: PlayService) {
				this.width = 600;
				this.height = 400;  
				}

	ngOnInit(): void {
		this.initLiveEventReciver();
		this.liveService.emit(ePlay.ON_GET_LIVE_GAMES);
		
		this.gameId = this.router.parseUrl(this.router.url).queryParams.game_id;
		this.location.replaceState(this.location.path().split('?')[0], '');
	}
	ngAfterViewInit(){}

	ngOnDestroy(): void {
		this.cancelStreaming();
		this.liveEventReciver.unsubscribe();
	}
	

    //renders every frame cleaning and drawing the elements
    renderFrame(): void {
		this.context?.clearRect(0, 0, this.liveCanvas.nativeElement.width, this.liveCanvas.nativeElement.height);
		this.context?.fillRect(this.ball.pos_x, this.ball.pos_y, this.ball.width, this.ball.height);
		this.context?.fillRect(this.pad_1.pos_x, this.pad_1.pos_y, this.pad_1.width, this.pad_1.height);
		this.context?.fillRect(this.pad_2.pos_x, this.pad_2.pos_y, this.pad_2.width, this.pad_2.height);
		
		this.animationFrame = window.requestAnimationFrame(() => {
			this.renderFrame()
		});
   }
	initLiveEventReciver(){
		this.liveEventReciver = this.liveService.liveEventEmitter.subscribe((data : any )=>{
			if (data.games)
				this.games = data.games;
			/* else if (data.stream)
				this.startStreaming(data.stream); */

			if (this.games.find(item => item.id == this.streaming.id) == undefined)
			{
				this.isStreaming = false;
				this.streaming = <WaitRoomI>{};
			}
			var game = this.games.find(item => item.id == Number(this.gameId));
			/* if (game != undefined)
				this.startStreaming(game); */
		})
	}

	startStreaming(game: WaitRoomI): void {
		this.isStreaming = true;
		this.streaming = game;
		this.context = this.liveCanvas.nativeElement.getContext('2d');
		this.liveService.liveEventEmitter.subscribe((data: any) => {			
			if (data.gameInfo !== undefined) {
				this.width = data.gameInfo.map.width;
				this.height = data.gameInfo.map.height;
				this.ball = data.gameInfo.ball;
				this.pad_1 = data.gameInfo.pad_1;
				this.pad_2 = data.gameInfo.pad_2;
			}
			if (this.animationFrame == undefined){
				console.log("Calling rendering function...");
					this.renderFrame();
			}
		});
		
		this.context?.clearRect(0, 0, this.liveCanvas.nativeElement.width, this.liveCanvas.nativeElement.height);
		
		this.streamInterval = setInterval(() => {
			this.liveService.emit(ePlay.ON_START_STREAM, this.streaming);
		}, 20);
	}

	cancelStreaming(): void {
		this.liveService.emit(ePlay.ON_STOP_STREAM, this.streaming);
		this.isStreaming = false;
		this.streaming = <WaitRoomI>{};
		clearInterval(this.streamInterval);
	}
}
