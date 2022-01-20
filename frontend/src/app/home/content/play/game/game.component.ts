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
   paddle: Paddle;
   boundaries: Boundaries;
   paddle_boundaries: Boundaries;
   fps: number = 60;
   moving_up = false;
   moving_down = false;
   
   ballImg = new Image();
	lastY: number;

   constructor(private socketService: SocketService,
				private playService: PlayService) {
        this.width = 600;
        this.height = 400;  
        this.fps = 60;
        this.ball = new Ball(20, 20, 3, { x: this.height / 2, y: this.width / 2 }, { x: 1, y: 1 });
        this.paddle = new Paddle(100, 10, 15000, { x: 15, y: (this.height / 2) });
        this.boundaries = this.ball.getCollisionBoundaries();
        this.paddle_boundaries = this.paddle.getCollisionBoundaries();
        console.log("Ball data from game: ", this.ball);
    }
 
   ngOnInit(): void {
     this.socket = this.socketService.getSocket();
	 this.playService.gameDataEmiter.subscribe((data: any) => {
		if (data.ball != undefined )
			this.ball.setPosition(data.ball);
		if (data.paddle1 != undefined )
		{
			this.paddle.setYPosition(data.paddle1);
			this.lastY = data.paddle1;
		}
		//if (data.paddle1 != undefined)
		//	this.paddle.setPosition(data.paddle1);
		

	});
   }
   
   //Call when the whole elements in the html document were loaded
   ngAfterViewInit(){
    this.context = this.gameCanvas.nativeElement.getContext('2d');
    this.ballImg.src = '../../.../../../../../assets/img/logo.png';
    this.context?.drawImage(this.ballImg, this.boundaries.left, this.boundaries.top, 40, 40);
   
    try {
            this.context?.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
			this.context?.fillRect(this.paddle_boundaries.left, this.paddle_boundaries.top, this.paddle.getWidth(), this.paddle.getHeight());
            this.context?.fillRect(this.boundaries.left, this.boundaries.top, this.ball.getWidth(), this.ball.getHeight());
            //this.context?.drawImage(this.ballImg, this.boundaries.left, this.boundaries.top, 40, 40);
            this.renderFrame();
            setInterval(() => this.fpsService(), 1 / this.fps); //call fpsService at 60hz (1/60), we can set this time
			setInterval(() => {

				if (this.prefs.userInfo.login == this.prefs.game.player1.login)
				{
					this.emitBall();
					this.emitPaddle1();
				}
				

				/* this.playService.emit(ePlay.ON_MATCH_DATA, {
					id: this.prefs.game.id,
					ball: this.ball.getPosition(),
					paddle1: this.paddle.getPosition()
				}) */
			}, 20);
		} catch(error){}
	
    }
    
    //Checks objects collisions. 'Till now only checks collision of the ball with four sides
    checkCollisions() {
        // Bottom/Top Collision
        let ballBounds = this.ball.getCollisionBoundaries();

        // Paddle Collision
        let paddleBounds = this.paddle.getCollisionBoundaries();

        // Left Collision
        if (ballBounds.left <= paddleBounds.right && ballBounds.bottom >= paddleBounds.top && ballBounds.top <= paddleBounds.bottom) {
            this.ball.reverseX();
        }

        if (ballBounds.left <= 0 /*ballBounds.right >= this.width*/) {
          //this.ball.reverseX();
          this.ball.setPosition({ x: this.width / 2, y: this.height / 2 });
        }

        else if (ballBounds.right >= this.width) {
          this.ball.reverseX();
        }

        if (ballBounds.bottom >= this.height || ballBounds.top <= 0)
            this.ball.reverseY();

        // Right left/right collision
  
    }

    //This function moves the elements and check if it is any colide
    fpsService() {
		if (this.prefs.userInfo.login == this.prefs.game.player1.login)
       	{
			this.ball.move();
			if (this.moving_up && this.paddle_boundaries.top > 0) {
				this.paddle.moveUp();
			}
			if (this.moving_down && this.paddle_boundaries.bottom < this.height) {
				this.paddle.moveDown();
			}
		}
        this.checkCollisions();
		//console.log((this.ball.getPosition()));
    }

    //renders every frame cleaning and drawing the elements
    renderFrame(): void {
        this.boundaries = this.ball.getCollisionBoundaries();
        this.paddle_boundaries = this.paddle.getCollisionBoundaries();
        this.context?.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
        this.context?.fillRect(this.paddle_boundaries.left, this.paddle_boundaries.top, this.paddle.getWidth(), this.paddle.getHeight());
        this.context?.fillRect(this.boundaries.left, this.boundaries.top, this.ball.getWidth(), this.ball.getHeight());
        //this.context?.drawImage(this.ballImg, this.boundaries.left, this.boundaries.top, this.ball.getWidth(), this.ball.getHeight());
        window.requestAnimationFrame(() => this.renderFrame());
   }
  
   move(direction: string) {
       this.context?.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
    }
	emitBall()
	{
		this.playService.emit(ePlay.ON_MATCH_DATA, {
			id: this.prefs.game.id,
			ball: this.ball.getPosition()
		})
	}
	emitPaddle1()
	{
		if (this.paddle.getPosition().y != this.lastY)
			this.playService.emit(ePlay.ON_MATCH_DATA, {
				id: this.prefs.game.id,
				paddle1: this.paddle.getPosition().y
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