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
 
 @Component({
   selector: 'app-game',
   templateUrl: './game.component.html',
   styleUrls: ['./game.component.css']
 })
 export class gameComponent implements OnInit, AfterViewInit {
   @ViewChild('game') gameCanvas: ElementRef<HTMLCanvasElement>;
   private socket: Socket;
   width: number;
   height: number;
   gameOptFilter: EventEmitter<any>;
   context: CanvasRenderingContext2D | null;
   ball: Ball;
   boundaries: Boundaries;
   fps: number = 60;
   
   constructor(private socketService: SocketService,) {
        this.width = 600;
        this.height = 400;  
        this.fps = 60;
        this.ball = new Ball(15, 15, 2, { x: this.height / 2, y: this.width / 2 }, { x: 1, y: 1 });
        this.boundaries = this.ball.getCollisionBoundaries();
        console.log("Ball data from game: ", this.ball);
    }
 
   ngOnInit(): void {
     this.socket = this.socketService.getSocket();
   }
   
   //Call when the whole elements in the html document were loaded
   ngAfterViewInit(){
    this.context = this.gameCanvas.nativeElement.getContext('2d');
   // this.renderFrame();
    try {
            this.context?.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
            this.context?.fillRect(this.ball.getPosition().x, this.ball.getPosition().y, this.ball.getWidth(), this.ball.getHeight());
            this.renderFrame();
            setInterval(() => this.fpsService(), 1 / this.fps); //call fpsService at 60hz (1/60), we can set this time
        } catch(error){}
    }
    
    //Checks objects collisions. 'Till now only checks collision of the ball with four sides
    checkCollisions() {
        // Bottom/Top Collision
        let ballBounds = this.ball.getCollisionBoundaries();
        if (ballBounds.bottom >= this.height || ballBounds.top <= 0)
            this.ball.reverseY();

        // Right left/right collision
        if (ballBounds.left <= 0 || ballBounds.right >= this.width) {
            this.ball.reverseX();   
        }
    }

    //This function moves the elements and check if it is any colide
    fpsService() {
        this.ball.move();
        this.checkCollisions();
    }

    //renders every frame cleaning and drawing the elements
    renderFrame(): void {
        this.boundaries = this.ball.getCollisionBoundaries();
        this.context?.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
        this.context?.fillRect(this.boundaries.left, this.boundaries.top, this.ball.getWidth(), this.ball.getHeight());
        window.requestAnimationFrame(() => this.renderFrame());
   }
  
   move(direction: string) {
       this.context?.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
    }
   
    @HostListener('window:keydown', ['$event'])
    keyUp(event: KeyboardEvent) {
        if (event.code == "ArrowUp") {
            this.move("up");
        }
        if (event.code == "ArrowDown") {
            this.move("down");
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