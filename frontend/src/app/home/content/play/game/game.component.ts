/**
 * http://andrewbar.net/blog/pong-with-angular-4/
 * https://github.com/Abarn279/angular-pong/blob/master/src/app/pong/pong.component.ts
 * https://www.youtube.com/watch?v=cXxEiWudIUY
 * https://www.thepolyglotdeveloper.com/2019/04/using-socketio-create-multiplayer-game-angular-nodejs/
 * https://www.youtube.com/watch?v=SZcY8cB8nhQ
 */

import { AfterViewInit, Component, OnInit, ViewChild, ElementRef, Input, HostListener, ɵAPP_ID_RANDOM_PROVIDER } from '@angular/core';
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

@Component({
	selector: 'app-game',
	templateUrl: './game.component.html',
	styleUrls: ['./game.component.css']
})
export class gameComponent implements OnInit, AfterViewInit {
	@ViewChild('game') gameCanvas: ElementRef<HTMLCanvasElement>;
	@Input() prefs: SharedPreferencesI;
	private socket: Socket;
	width: number;
	height: number;
	gameOptFilter: EventEmitter<any>;
	context: CanvasRenderingContext2D | null;
	ball: Ball;
	pad_1: Paddle;
	pad_2: Paddle;
	boundBall: Boundaries;
	boundPad_1: Boundaries;
	boundPad_2: Boundaries;
	fps: number = 60;
	moving_up = false;
	moving_down = false;
	ballImg = new Image();
	oldPos1_Y: number;
	oldPos2_Y: number;

	constructor(private socketService: SocketService,
		private playService: PlayService) {
		this.width = 600;
		this.height = 400;
		this.fps = 60;
		this.ball = new Ball(10, 10, 3, { x: this.height / 2, y: this.width / 2 }, { x: 1, y: 1 });
		this.pad_1 = new Paddle(75, 10, 15000, { x: 50, y: (this.height / 2) });
		this.pad_2 = new Paddle(75, 10, 15000, { x: this.width - 50, y: (this.height / 2) });
		this.boundBall = this.ball.getCollisionBoundaries();
		this.boundPad_1 = this.pad_1.getCollisionBoundaries();
		this.boundPad_2 = this.pad_2.getCollisionBoundaries();
		console.log("Ball data from game: ", this.ball);
	}

	ngOnInit(): void {
		this.socket = this.socketService.getSocket();
		this.playService.gameDataEmiter.subscribe((data: any) => {
			if (data.b != undefined)
				this.ball.setPosition(data.b);
			if (data.p1 != undefined) {
				this.pad_1.setYPosition(data.p1);
				this.oldPos1_Y = data.p1;
			}
			if (data.p2 != undefined) {
				this.pad_2.setYPosition(data.p2);
				this.oldPos2_Y = data.p2;
			}
		});
	}

	//Call when the whole elements in the html document were loaded
	ngAfterViewInit() {
		this.context = this.gameCanvas.nativeElement.getContext('2d');
		/*this.ballImg.src = '../../.../../../../../assets/img/logo.png';
		this.context?.drawImage(this.ballImg, this.boundBall.left, this.boundBall.top, 40, 40);*/

		try {
			/* this.context?.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
			this.context?.fillRect(this.boundPad_1.left, this.boundPad_1.top, this.pad_1.getWidth(), this.pad_1.getHeight());
			this.context?.fillRect(this.boundBall.left, this.boundBall.top, this.ball.getWidth(), this.ball.getHeight()); */
			//this.context?.drawImage(this.ballImg, this.boundBall.left, this.boundBall.top, 40, 40);
			this.renderFrame();
			setInterval(() => this.fpsService(), 20); //call fpsService at 60hz (1/60), we can set this time
			setInterval(() => {
				if (this.prefs.userInfo.login == this.prefs.game.player1.login) {
					this.emitBall();
					this.emitPaddle1();
				} else {
					this.emitPaddle2();
				}
			}, 20);
		} catch (error) { }

	}

	//Checks objects collisions. 'Till now only checks collision of the ball with four sides
	checkCollisions() {
		
			


		// Bottom/Top Collision
			this.boundBall = this.ball.getCollisionBoundaries();

		// Paddle Collision
			this.boundPad_1 = this.pad_1.getCollisionBoundaries();
			this.boundPad_2 = this.pad_2.getCollisionBoundaries();

		// Left Collision
		if (this.boundBall.left <= this.boundPad_1.right && this.boundBall.bottom >= this.boundPad_1.top && this.boundBall.top <= this.boundPad_1.bottom) {
			this.ball.reverseX();
		}
		// Right Collision
		if (this.boundBall.right >= this.boundPad_2.left && this.boundBall.bottom >= this.boundPad_2.top && this.boundBall.top <= this.boundPad_2.bottom) {
			this.ball.reverseX();
		} 

		if (this.boundBall.left <= 0 || this.boundBall.right >= this.width) {
			this.ball.reverseX();
			this.ball.setPosition({ x: this.width / 2, y: this.height / 2 });
		}

		/* if (this.boundBall.right >= this.width) {
			this.ball.reverseX();
			this.ball.setPosition({ x: this.width / 2, y: this.height / 2 });
		} */

		if (this.boundBall.bottom >= this.height || this.boundBall.top <= 0)
			this.ball.reverseY();

		// Right left/right collision

	}

	//This function moves the elements and check if it is any colide
	fpsService() {
		this.checkCollisions();
		if (this.prefs.userInfo.login == this.prefs.game.player1.login) {
			this.ball.move();
			if (this.moving_up && this.boundPad_1.top > 0) {
				this.pad_1.moveUp();
			}
			if (this.moving_down && this.boundPad_1.bottom < this.height) {
				this.pad_1.moveDown();
			}
		} else {
			if (this.moving_up && this.boundPad_2.top > 0) {
				this.pad_2.moveUp();
			}
			if (this.moving_down && this.boundPad_2.bottom < this.height) {
				this.pad_2.moveDown();
			}
		}
		//console.log((this.ball.getPosition()));
	}

	//renders every frame cleaning and drawing the elements
	renderFrame(): void {
		this.boundBall = this.ball.getCollisionBoundaries();
		this.boundPad_1 = this.pad_1.getCollisionBoundaries();
		this.boundPad_2 = this.pad_2.getCollisionBoundaries();
		this.context?.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
		this.context?.fillRect(this.boundPad_1.left, this.boundPad_1.top, this.pad_1.getWidth(), this.pad_1.getHeight());
		this.context?.fillRect(this.boundPad_2.left, this.boundPad_2.top, this.pad_2.getWidth(), this.pad_2.getHeight());
		this.context?.fillRect(this.boundBall.left, this.boundBall.top, this.ball.getWidth(), this.ball.getHeight());
		//this.context?.drawImage(this.ballImg, this.boundBall.left, this.boundBall.top, this.ball.getWidth(), this.ball.getHeight());
		window.requestAnimationFrame(() => this.renderFrame());
	}

	move(direction: string) {
		this.context?.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
	}
	emitBall() {
		this.playService.emit(ePlay.ON_MATCH_DATA, {
			id: this.prefs.game.id,
			b: this.ball.getPosition()
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
	}
	@HostListener('window:keydown', ['$event'])
	keyUp(event: KeyboardEvent) {
		if (event.code == "ArrowUp") {
			this.moving_up = true;
		}
		if (event.code == "ArrowDown") {
			this.moving_down = true;
		}
	}

	@HostListener('window:keyup', ['$event'])
	keyDown(event: KeyboardEvent) {
		if (event.code == "ArrowUp")
			this.moving_up = false;
		if (event.code == "ArrowDown")
			this.moving_down = false;
	}
}