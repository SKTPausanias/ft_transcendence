/**
 * http://andrewbar.net/blog/pong-with-angular-4/
 * https://github.com/Abarn279/angular-pong/blob/master/src/app/pong/pong.component.ts
 * https://www.youtube.com/watch?v=cXxEiWudIUY
 * https://www.thepolyglotdeveloper.com/2019/04/using-socketio-create-multiplayer-game-angular-nodejs/
 * https://www.youtube.com/watch?v=SZcY8cB8nhQ
 */

 import { AfterViewInit, Component, OnInit, ViewChild, ElementRef, Input, HostListener } from '@angular/core';
 import { wSocket } from 'src/app/shared/ft_enums';
 import { iBallPosition } from './classes/iBallPosition';
 import { Injectable, EventEmitter } from "@angular/core";
 import { io, Socket } from "socket.io-client";
 import { SocketService } from '../../socket.service';
 import { Ball } from './classes/ball';
 
 @Component({
   selector: 'app-play',
   templateUrl: './play.component.html',
   styleUrls: ['./play.component.css']
 })
 export class PlayComponent implements OnInit, AfterViewInit {
   @ViewChild('game') gameCanvas: ElementRef<HTMLCanvasElement>;
   private socket: Socket;
   gameOptFilter: EventEmitter<any>;
   context: CanvasRenderingContext2D | null;
   private position: iBallPosition;
   public ball: Ball;
   //paddle_a: Paddle;
   
   constructor(private socketService: SocketService) {
     this.gameOptFilter = new EventEmitter<any>();
     this.position = {
       direction: "",
       x: 20,
       y: 20
     };
     this.ball = new Ball(15, 15, 2, { x: 10 / 2, y: 10 / 2 }, { x: 1, y: 1 });
     //this.paddle = new Paddle(...);
 
   }
 
   ngOnInit(): void {
     this.socket = this.socketService.getSocket();
     this.gameOptFilter.subscribe((data: any) => {
       console.log("Calling subscrition");
       this.position = data;
     });
   }
 
   ngAfterViewInit(){
     this.context = this.gameCanvas.nativeElement.getContext('2d');
     try {
       this.socket.on(wSocket.GAME_POSITION, (data: any) => {
           this.context?.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
           this.context?.fillRect(data.x, data.y, 10, 50);
          
           //this.renderFrame();
           this.gameOptFilter.emit(data);
       });
     } catch(error){}
   }
 
   move(direction: string)
   {
     this.position.direction = direction;
     this.socket.emit(wSocket.GAME_POSITION, this.position);
   }
 
   renderFrame(): void {
     // Run rendering logic ...
      //draw(this.ball);
     //draw(paddle_a);
     
     window.requestAnimationFrame(() => this.renderFrame());
   }
 
   @HostListener('window:keydown', ['$event'])
   keyUp(event: KeyboardEvent) {
     if (event.code == "ArrowUp") {
        //console.log("start upping: ", event.code);
        this.move("up");
       //this.controlState.upPressed = true;
     }
     if (event.code == "ArrowDown") {
      // console.log("start downing: ", event.code);
       this.move("down");
       //this.controlState.downPressed = true;
     }
     if (event.code == "ArrowLeft") {
       this.move("left");
     }
     if (event.code == "ArrowRight") {
       this.move("right");
     }
   }
 
   @HostListener('window:keyup', ['$event'])
   keyDown(event: KeyboardEvent) {
     console.log("pressed: ", event.code);
     if (event.code == "ArrowUp") {
      // console.log("stop upping: ", event.code);
       //this.controlState.upPressed = false;
     }
     if (event.code == "ArrowDown") {
      // console.log("stop downing: ", event.code);
       //this.controlState.downPressed = false;
     }
   }
 }
 