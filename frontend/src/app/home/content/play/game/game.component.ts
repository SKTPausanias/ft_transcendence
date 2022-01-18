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
 /* import { iBallPosition } from './classes/iBallPosition';
 import { Ball } from './classes/ball'; */
 
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
   y: number;
   gameOptFilter: EventEmitter<any>;
   context: CanvasRenderingContext2D | null;
   /* private position: iBallPosition;
   public ball: Ball; */
   //paddle_a: Paddle;
   
   constructor(private socketService: SocketService,) {
        this.width = 600;
        this.height = 400;   
        this.y = (this.height / 2) - 25;
    }
 
   ngOnInit(): void {
     this.socket = this.socketService.getSocket();
    
   }
 
   ngAfterViewInit(){
    this.context = this.gameCanvas.nativeElement.getContext('2d');
    try {
          this.context?.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
          this.context?.fillRect(100, this.y, 10, 50);
         
          //this.renderFrame();
    } catch(error){}
   }
 
   move(direction: string){
        this.context?.clearRect(0, 0, this.gameCanvas.nativeElement.width, this.gameCanvas.nativeElement.height);
        this.context?.fillRect(100, this.y, 10, 50);
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
        this.y -= 20;
        this.move("up");
       //this.controlState.upPressed = true;
     }
     if (event.code == "ArrowDown") {
       //console.log("start downing: ", event.code);
       this.y += 20;
       this.move("down");
       //this.controlState.downPressed = true;
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