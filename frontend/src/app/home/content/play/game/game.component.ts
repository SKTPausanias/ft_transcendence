/**
 * http://andrewbar.net/blog/pong-with-angular-4/
 * https://github.com/Abarn279/angular-pong/blob/master/src/app/pong/pong.component.ts
 * https://www.youtube.com/watch?v=cXxEiWudIUY
 * https://www.thepolyglotdeveloper.com/2019/04/using-socketio-create-multiplayer-game-angular-nodejs/
 * https://www.youtube.com/watch?v=SZcY8cB8nhQ
 */

import { AfterViewInit, Component, OnInit, ViewChild, ElementRef, Input, HostListener, ɵAPP_ID_RANDOM_PROVIDER, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ePlay } from 'src/app/shared/ft_enums';
import { SocketService } from '../../../socket.service';
import { SharedPreferencesI, WaitRoomI } from 'src/app/shared/ft_interfaces';
import { PlayService } from '../play.service';
import { BallI, GameDataI, PadI } from 'src/app/shared/interface/iPlay';

@Component({
	selector: 'app-game',
	templateUrl: './game.component.html',
	styleUrls: ['./game.component.css']
})
export class gameComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('game') gameCanvas: ElementRef<HTMLCanvasElement>;
	@Input() prefs: SharedPreferencesI;
	@Output() sndWinner = new EventEmitter<boolean>();
	context: CanvasRenderingContext2D | null;
	ball: BallI;
	pad_1: PadI;
	pad_2: PadI;
	width: number;
	height: number;
	movableInterval: any;
	animationFrame: any;
	moving_up = false;
	moving_down = false;
	maxScore: number = 3;
	p1_score: number = 0;
	p2_score: number = 0;
	gameFinished: boolean = false;
	
	constructor(private socketService: SocketService,
		private playService: PlayService) {
		this.width = 0;
		this.height = 0;
	}

	ngOnInit(): void {		
		this.playService.gameDataEmiter.subscribe((data: any) => {
			if (data.gameInfo !== undefined) {
				console.log(data.gameInfo.gameFinished);
				this.width = data.gameInfo.map.width;
				this.height = data.gameInfo.map.height;
				this.ball = data.gameInfo.ball;
				this.pad_1 = data.gameInfo.pad_1;
				this.pad_2 = data.gameInfo.pad_2;
				this.p1_score = data.gameInfo.score_p1;
				this.p2_score = data.gameInfo.score_p2;
				if (data.gameInfo.gameFinished && !this.gameFinished) {
					this.gameFinished = true;
					console.log("Game finished", this.gameFinished);
					this.sndWinner.emit(true);
				}
				if (this.animationFrame == undefined)
					this.renderFrame();
			}
		});
	}
	ngOnDestroy(): void {
		clearInterval(this.movableInterval);
		window.cancelAnimationFrame(this.animationFrame);
	}

	//Call when the whole elements in the html document were loaded
	ngAfterViewInit() {
		this.context = this.gameCanvas.nativeElement.getContext('2d');
		this.playService.emit(ePlay.ON_START_GAME, this.prefs.game.id);
		this.movableInterval = setInterval(() => {
			this.emitMoveable();
		}, 20);
	}

	//renders every frame cleaning and drawing the elements
	renderFrame(): void {
		this.context?.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
		this.context?.fillRect(this.ball.pos_x, this.ball.pos_y, this.ball.width, this.ball.height);
		this.context?.fillRect(this.pad_1.pos_x, this.pad_1.pos_y, this.pad_1.width, this.pad_1.height);
		this.context?.fillRect(this.pad_2.pos_x, this.pad_2.pos_y, this.pad_2.width, this.pad_2.height);
		this.animationFrame = window.requestAnimationFrame(() => {
			this.renderFrame()
		});
	}

	emitMoveable() {
		if (this.gameFinished)
		{
			clearInterval(this.movableInterval);
			return;
		}
		var gameData: GameDataI = <GameDataI>{};
		gameData.id = this.prefs.game.id;
		gameData.up = this.moving_up;
		gameData.down = this.moving_down;
		gameData.p1 = this.prefs.game.player1.login == this.prefs.userInfo.login;
		/* !gameFinished */
		this.playService.emit(ePlay.ON_GAME_MOVING, gameData);
	}
	cancelGame(){
		this.sndWinner.emit(true);
	}

	@HostListener('window:keydown', ['$event'])
	keyUp(event: KeyboardEvent) {
		if (event.code == "ArrowUp")
			this.moving_up = true;
		if (event.code == "ArrowDown")
			this.moving_down = true;
	}
	
	@HostListener('window:keyup', ['$event'])
	keyDown(event: KeyboardEvent) {
		if (event.code == "ArrowUp")
			this.moving_up = false;
		if (event.code == "ArrowDown")
			this.moving_down = false;
	}
}