/**
 * http://andrewbar.net/blog/pong-with-angular-4/
 * https://github.com/Abarn279/angular-pong/blob/master/src/app/pong/pong.component.ts
 * https://www.youtube.com/watch?v=cXxEiWudIUY
 * https://www.thepolyglotdeveloper.com/2019/04/using-socketio-create-multiplayer-game-angular-nodejs/
 * https://www.youtube.com/watch?v=SZcY8cB8nhQ
 */

 import { AfterViewInit, Component, OnInit, ViewChild, ElementRef, Input, HostListener } from '@angular/core';
 import { wSocket } from 'src/app/shared/ft_enums';
 import { EventEmitter } from "@angular/core";
 import { SocketService } from '../../../socket.service';
 import { io, Socket } from "socket.io-client";
 import { iBallPosition } from './classes/iBallPosition';
 import { Ball } from './classes/ball';
 import { Boundaries } from './classes/iPosition'
import { SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { Paddle } from './classes/paddle';
import { toHash } from 'ajv/dist/compile/util';
 
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
   
   ballImg = new Image();


   constructor(private socketService: SocketService,) {
        this.width = 600;
        this.height = 400;  
        this.fps = 60;
        this.ball = new Ball(20, 20, 1, { x: this.height / 2, y: this.width / 2 }, { x: 1, y: 1 });
        this.paddle = new Paddle(100, 15, 5000, { x: 15, y: (this.height / 2) });
        this.boundaries = this.ball.getCollisionBoundaries();
        this.paddle_boundaries = this.paddle.getCollisionBoundaries();
        console.log("Ball data from game: ", this.ball);
    }
 
   ngOnInit(): void {
     this.socket = this.socketService.getSocket();
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
        this.ball.move();
        this.checkCollisions();
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
   
    @HostListener('window:keydown', ['$event'])
    keyUp(event: KeyboardEvent) {
        if (event.code == "ArrowUp" && this.paddle_boundaries.top > 0) {
            this.paddle.moveUp();
        }
        if (event.code == "ArrowDown" && this.paddle_boundaries.bottom < this.height) {
            this.paddle.moveDown();
        }
   }
 
  /*  @HostListener('window:keyup', ['$event'])
   keyDown(event: KeyboardEvent) {
     console.log("pressed: ", event.code);
     if (event.code == "ArrowUp") {
      console.log("stop upping: ", event.code);
       //this.controlState.upPressed = false;
     }
     if (event.code == "ArrowDown") {
      console.log("stop downing: ", event.code);
       //this.controlState.downPressed = false;
     }
   } */
 }