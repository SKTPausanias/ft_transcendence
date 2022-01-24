/**
 * http://andrewbar.net/blog/pong-with-angular-4/
 * https://github.com/Abarn279/angular-pong/blob/master/src/app/pong/pong.component.ts
 * https://www.youtube.com/watch?v=cXxEiWudIUY
 * https://www.thepolyglotdeveloper.com/2019/04/using-socketio-create-multiplayer-game-angular-nodejs/
 * https://www.youtube.com/watch?v=SZcY8cB8nhQ
 */

import { AfterViewInit, Component, OnInit, ViewChild, ElementRef, Input, HostListener, ɵAPP_ID_RANDOM_PROVIDER, OnDestroy } from '@angular/core';
import { ePlay, wSocket } from 'src/app/shared/ft_enums';
import { EventEmitter } from "@angular/core";
import { SocketService } from '../../../socket.service';
import { io, Socket } from "socket.io-client";
import { iBallPosition } from './classes/iBallPosition';
import { Ball } from './classes/ball';
import { Boundaries } from './classes/iPosition'
import { SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { Paddle } from './classes/paddle';
import { toHash } from 'ajv/dist/compile/util';
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
	private socket: Socket;
	width: number;
	height: number;
	gameOptFilter: EventEmitter<any>;
	context: CanvasRenderingContext2D | null;
	ball: BallI;
	pad_1: PadI;
	pad_2: PadI;
	movableInterval: any;
	animationFrame: any;



	//
	fps: number = 60;
	moving_up = false;
	moving_down = false;
	ballImg = new Image();
	oldPos1_Y: number;
	oldPos2_Y: number;
	fpsInterval: any;
	emitInterval: any;
	paddUpInterval: any;
	paddDownInterval: any;
	



	constructor(private socketService: SocketService,
		private playService: PlayService) {
		this.width = 0;
		this.height = 0;
		this.fps = 60;
		/* //inicializamos
		this.ball = new Ball(10, 10, 3, { x: this.width / 2, y: this.height / 2 }, { x: 1, y: 1 });
		this.pad_1 = new Paddle(75, 10, 15000, { x: 50, y: (this.height / 2) });
		this.pad_2 = new Paddle(75, 10, 15000, { x: this.width - 50, y: (this.height / 2) });
		//enviamos al backend
		this.boundBall = this.ball.getCollisionBoundaries();
		this.boundPad_1 = this.pad_1.getCollisionBoundaries();
		this.boundPad_2 = this.pad_2.getCollisionBoundaries();
		console.log("Ball data from game: ", this.ball); */
	}

	ngOnInit(): void {		
		this.playService.gameDataEmiter.subscribe((data: any) => {
			if (data.gameInfo !== undefined) {
				this.width = data.gameInfo.map.width;
				this.height = data.gameInfo.map.height;
				this.ball = data.gameInfo.ball;
				this.pad_1 = data.gameInfo.pad_1;
				this.pad_2 = data.gameInfo.pad_2;
				if (this.animationFrame == undefined)
					this.renderFrame();
			}
		});
	}
	ngOnDestroy(): void {
		/*clearInterval(this.fpsInterval);
		clearInterval(this.emitInterval);*/
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
		var gameData: GameDataI = <GameDataI>{};
		gameData.id = this.prefs.game.id;
		gameData.up = this.moving_up;
		gameData.down = this.moving_down;
		gameData.p1 = this.prefs.game.player1.login == this.prefs.userInfo.login;
		
		this.playService.emit(ePlay.ON_GAME_MOVING, gameData)
	}

	/* emitBall() {
		this.playService.emit(ePlay.ON_MATCH_DATA, {
			id: this.prefs.game.id,
			b: this.ball.getPosition(),
			s: this.ball.getSpeedRatio()
		})
	}
	emitPaddle1() {
		if (this.pad_1.getPosition().y != this.oldPos1_Y)
			this.playService.emit(ePlay.ON_MATCH_DATA, {
				id: this.prefs.game.id,
				p1: this.pad_1.getPosition().y
			})
	}
	emitPaddle2() {
		if (this.pad_2.getPosition().y != this.oldPos2_Y)
			this.playService.emit(ePlay.ON_MATCH_DATA, {
				id: this.prefs.game.id,
				p2: this.pad_2.getPosition().y
			})
	} */
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