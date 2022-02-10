/**
 * git pull
 * 
 * https://github.com/Abarn279/angular-pong/blob/master/src/app/pong/pong.component.ts
 * https://www.youtube.com/watch?v=cXxEiWudIUY
 * https://www.thepolyglotdeveloper.com/2019/04/using-socketio-create-multiplayer-game-angular-nodejs/
 * https://www.youtube.com/watch?v=SZcY8cB8nhQ
 */

import { AfterViewInit, Component, OnInit, ViewChild, ElementRef, Input, HostListener, ɵAPP_ID_RANDOM_PROVIDER, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ePlay } from 'src/app/shared/ft_enums';
import { LiveService } from '../../live/live.service';
import { SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { PlayService } from '../play.service';
import { BallI, GameDataI, GameI, GameMoveableI, MapI, PadI } from 'src/app/shared/interface/iPlay';
import { ePlayMode } from 'src/app/shared/enums/ePlay';

@Component({
	selector: 'app-game',
	templateUrl: './game.component.html',
	styleUrls: ['./game.component.css']
})
export class gameComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('game') gameCanvas: ElementRef<HTMLCanvasElement>;
	@Input() prefs: SharedPreferencesI;
	@Output() sndWinner = new EventEmitter<GameI>();
	context: CanvasRenderingContext2D | null;
	liveViewerReciver: any;
	viewers: number;
	ball: BallI;
	pad_1: PadI;
	pad_2: PadI;
	width: number;
	height: number;
	movableInterval: any;
	animationFrame: any;
	moving_up = false;
	moving_down = false;
	shoots: boolean = false;
	maxScore: number;
	p1_score: number;
	p2_score: number;
	hits_p1: number;
	hits_p2: number;
	gameFinished: boolean = false;
	cont: any;
	modeImg = new Image();
	circleImg = new Image();
	game_mode: number;
	
	constructor(private liveService: LiveService,
		private playService: PlayService) {
		this.width = 0;
		this.height = 0;
		this.maxScore = 0;
		this.p1_score = 0;
		this.p2_score = 0;
		this.hits_p1 = 0;
		this.hits_p2 = 0;
		this.viewers = 0;
		
	}

	ngOnInit(): void {
		this.playService.gameDataEmiter.subscribe((data: any) => {
			if (data.gameInfo !== undefined) {
				this.width = data.gameInfo.map.width;
				this.height = data.gameInfo.map.height;
				this.ball = data.gameInfo.ball;
				this.pad_1 = data.gameInfo.pad_1;
				this.pad_2 = data.gameInfo.pad_2;
				this.p1_score = data.gameInfo.score_p1;
				this.p2_score = data.gameInfo.score_p2;
				this.hits_p1 = data.gameInfo.hits_p1;
				this.hits_p2 = data.gameInfo.hits_p2;
				this.gameFinished = data.gameInfo.gameFinished;
				this.game_mode = data.gameInfo.game_mode;
				if (data.gameInfo.gameFinished)
					this.sndWinner.emit(data.gameInfo);
				if (this.animationFrame == undefined)
					this.renderFrame();
			}
		});
	}
	
	//Call when the whole elements in the html document were loaded
	ngAfterViewInit() {
		this.liveViewerReciver = this.liveService.liveViewersEmitter.subscribe((data: any)=>{
			console.log("entering on subscribe:", data);
			this.viewers = data
		});
		console.log("refreshing game: ", this.prefs.game);
		this.liveService.emit(ePlay.ON_GET_LIVE_VIEWERS, this.prefs.game);
		this.context = this.gameCanvas.nativeElement.getContext('2d');
		this.cont = document.getElementById("canvasCtn");
		this.setModeImage();
		this.circleImg.src = "/assets/img/play_modes/mid_circle.png"
		if (this.cont != undefined)
		{
			this.gameCanvas.nativeElement.width = this.cont.clientWidth;
			this.gameCanvas.nativeElement.height = this.cont.clientHeight;
		}
		this.playService.emit(ePlay.ON_START_GAME, this.prefs.game.id);
		this.movableInterval = setInterval(() => {
			this.emitMoveable();
		}, 20);
	}

	ngOnDestroy(): void {
		clearInterval(this.movableInterval);
		window.cancelAnimationFrame(this.animationFrame);
		this.liveViewerReciver.unsubscribe();
	}

	//renders every frame cleaning and drawing the elements
	renderFrame(): void {
		this.resize();
		this.context?.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
		this.context?.drawImage(this.modeImg, 0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height)
		if (this.context != undefined)
			this.context.fillStyle = '#ffffff';
		
		this.context?.fillRect(this.ball.pos_x, this.ball.pos_y, this.ball.width, this.ball.height);
		this.context?.fillRect(this.pad_1.pos_x, this.pad_1.pos_y, this.pad_1.width, this.pad_1.height);
		this.context?.fillRect(this.pad_2.pos_x, this.pad_2.pos_y, this.pad_2.width, this.pad_2.height);
		this.context?.fillRect(this.width - 10, this.height-10, 5, 5);
		this.context?.fillRect(10, 10, 5, 5);
		this.context?.fillRect(10, this.height -10, 5, 5);
		this.context?.fillRect(this.width - 10, 10, 5, 5);
		if (this.game_mode == ePlayMode.ANGLE) {
			var d = this.pad_1.height * 2.5;
			var x = (this.width / 2) - (d / 2);
			var y = (this.height / 2) - (d / 2);
			//this.context?.beginPath();	
			//this.context?.arc(this.width /2, this.height /2, this.pad_1.height, 0, 2 * Math.PI, false);
			this.context?.drawImage(this.circleImg, x, y, d, d)
			//this.context?.beginPath();
			this.context?.fill();

		}
		this.animationFrame = window.requestAnimationFrame(() => {
			this.renderFrame()
		});
	}

	emitMoveable(): void {
		if (!this.gameFinished)
		{
			var gameData: GameDataI = <GameDataI>{};
			gameData.id = this.prefs.game.id;
			gameData.up = this.moving_up;
			gameData.down = this.moving_down;
			gameData.shoots = this.shoots;
			gameData.p1 = this.prefs.game.player1.login == this.prefs.userInfo.login;
			/* !gameFinished */
			this.playService.emit(ePlay.ON_GAME_MOVING, gameData);
		}
		else
			clearInterval(this.movableInterval);
	}

	cancelGame(): void {
		var gameInfo: GameI = <GameI>{};
		gameInfo.map = <MapI>{};
		gameInfo.map.width = this.width;
		gameInfo.map.height = this.height;
		gameInfo.ball = this.ball;
		gameInfo.pad_1 = this.pad_1;
		gameInfo.pad_2 = this.pad_2;
		//check if i am player 1
		if (this.prefs.game.player1.login == this.prefs.userInfo.login) {
			gameInfo.score_p1 = 0;
			gameInfo.score_p2 = 3;
		}
		else {
			gameInfo.score_p1 = 3;
			gameInfo.score_p2 = 0;
		}
		gameInfo.hits_p1 = this.hits_p1;
		gameInfo.hits_p2 = this.hits_p2;
		gameInfo.gameFinished = true;
		this.sndWinner.emit(gameInfo);
	}

	resize(): void {
		var padd_ratio_x = this.gameCanvas.nativeElement.width / this.width;
		var padd_ratio_y = this.gameCanvas.nativeElement.height / this.height;
		this.width = this.gameCanvas.nativeElement.width;
		this.height = this.gameCanvas.nativeElement.height;
		
		this.resizeVector(this.pad_1, padd_ratio_x, padd_ratio_y);
		this.resizeVector(this.pad_2, padd_ratio_x, padd_ratio_y);
		this.resizeVector(this.ball, padd_ratio_x, padd_ratio_y);
	}

	resizeVector(obj: GameMoveableI, rx: number, ry: number): void {
		obj.width *= rx;
		obj.height *= ry;
		obj.pos_x *= rx;
		obj.pos_y *= ry;
	}

	setModeImage(): void {
		if (this.prefs.game.play_modes[0] == ePlayMode.CLASIC)
			this.modeImg.src = '/assets/img/play_modes/clasic_mode.png';
		else if (this.prefs.game.play_modes[0] == ePlayMode.POWER)
			this.modeImg.src = '/assets/img/play_modes/power_mode.png';
		else if (this.prefs.game.play_modes[0] == ePlayMode.ANGLE)
			this.modeImg.src = '/assets/img/play_modes/angle_mode.png';
	}

	@HostListener('window:keydown', ['$event'])
	keyUp(event: KeyboardEvent): void {
		if (event.code == "ArrowUp")
			this.moving_up = true;
		if (event.code == "ArrowDown")
			this.moving_down = true;
		if (event.code == "Space")
			this.shoots = true;
	}
	
	@HostListener('window:keyup', ['$event'])
	keyDown(event: KeyboardEvent): void {
		if (event.code == "ArrowUp")
			this.moving_up = false;
		if (event.code == "ArrowDown")
			this.moving_down = false;
		if (event.code == "Space")
			this.shoots = false;
	}
	
	@HostListener('window:resize', ['$event'])
	onWindowResize(event: KeyboardEvent): void {
		if (this.cont != undefined)
		{
			this.gameCanvas.nativeElement.width = this.cont.clientWidth;
			this.gameCanvas.nativeElement.height = this.cont.clientHeight;
		}	
	}
}