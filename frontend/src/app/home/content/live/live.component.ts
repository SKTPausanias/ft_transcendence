import { Component, OnInit, Input, ViewChild, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import { ePlay } from "src/app/shared/ft_enums";
import { SharedPreferencesI, WaitRoomI } from "src/app/shared/ft_interfaces";
import { SessionStorageQueryService } from "src/app/shared/ft_services";
import { LiveService } from "./live.service";
import { Location } from '@angular/common';
import { PlayService } from "../play/play.service";
import { Ball } from "../play/game/classes/ball";
import { Paddle } from "../play/game/classes/paddle";
import { Boundaries } from "../play/game/classes/iPosition";


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
	ball: Ball;
	pad_1: Paddle;
	pad_2: Paddle;
	boundBall: Boundaries;
	boundPad_1: Boundaries;
	boundPad_2: Boundaries;
	width: number;
	height: number;
	renderInited: boolean;

	constructor(private liveService: LiveService,
				private router: Router,
				private location: Location,
				private sQuery: SessionStorageQueryService,
				private playService: PlayService) {
				//console.log(" params: ", this.router.parseUrl(this.router.url).queryParams);
				this.width = 600;
				this.height = 400;  
				this.ball = new Ball(10, 10, 3, { x: this.height / 2, y: this.width / 2 }, { x: 1, y: 1 });
				this.pad_1 = new Paddle(75, 10, 15000, { x: 50, y: (this.height / 2) });
				this.pad_2 = new Paddle(75, 10, 15000, { x: this.width - 50, y: (this.height / 2) });
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
	ngAfterViewInit(){
		try {
			this.context = this.liveCanvas.nativeElement.getContext('2d');
				this.context?.clearRect(0, 0, this.liveCanvas.nativeElement.width, this.liveCanvas.nativeElement.height);
				//this.context?.drawImage(this.ballImg, this.boundaries.left, this.boundaries.top, 40, 40);
				//this.renderFrame();
			} catch(error){}
		}

	ngOnDestroy(): void {
		this.cancelStreaming();
		this.liveEventReciver.unsubscribe();
	}
	

    //renders every frame cleaning and drawing the elements
    renderFrame(): void {
		this.boundBall = this.ball.getCollisionBoundaries();
        this.boundPad_1 = this.pad_1.getCollisionBoundaries();
        this.boundPad_2 = this.pad_2.getCollisionBoundaries();
		this.context?.clearRect(0, 0, this.liveCanvas.nativeElement.width, this.liveCanvas.nativeElement.height);
        this.context?.fillRect(this.boundBall.left, this.boundBall.top, this.ball.getWidth(), this.ball.getHeight());        
        this.context?.fillRect(this.boundPad_1.left, this.boundPad_1.top, this.pad_1.getWidth(), this.pad_1.getHeight());    
        this.context?.fillRect(this.boundPad_2.left, this.boundPad_2.top, this.pad_2.getWidth(), this.pad_2.getHeight());
		window.requestAnimationFrame(() => this.renderFrame());
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
		this.context = this.liveCanvas.nativeElement.getContext('2d');
		this.context?.clearRect(0, 0, this.liveCanvas.nativeElement.width, this.liveCanvas.nativeElement.height);
		this.playService.liveDataEmiter.subscribe((data: any) => {
			if (data.b != undefined)
				this.ball.setPosition(data.b);
			if (data.p1 != undefined)
				this.pad_1.setYPosition(data.p1);
			if (data.p2 != undefined)
				this.pad_2.setYPosition(data.p2);
			if (!this.renderInited)
			{
				this.renderInited = true;
				this.renderFrame();
			}

		});
	}

	cancelStreaming(): void {
		this.liveService.emit(ePlay.ON_STOP_STREAM, this.streaming);
		this.isStreaming = false;
		this.streaming = <WaitRoomI>{};
	}
}
