import { Component, ElementRef, Input, OnInit, Output, ViewChild, EventEmitter, HostListener } from "@angular/core";
import { ePlay } from "src/app/shared/ft_enums";
import { WaitRoomI } from "src/app/shared/ft_interfaces";
import { SessionStorageQueryService } from "src/app/shared/ft_services";
import { BallI, GameMoveableI, PadI } from "src/app/shared/interface/iPlay";
import { PlayService } from "../../play/play.service";
import { LiveService } from "../live.service";
import { Location } from '@angular/common';
import { ePlayMode } from "src/app/shared/enums/ePlay";

@Component({
	selector: "app-canvas",
	templateUrl: "./canvas.component.html",
	styleUrls: ["./canvas.component.css"],
})
export class CanvasComponent implements OnInit {  
	@ViewChild('canvas_watch') liveCanvas: ElementRef<HTMLCanvasElement>;
	@Input() game: WaitRoomI;
	@Output() sndEvent = new EventEmitter<boolean>();
 
	isStreaming: boolean = false;

	liveEventReciver: any;
	session = this.sQuery.getSessionToken();
	streaming: WaitRoomI = <WaitRoomI>{};
	streamInterval: any;
	animationFrame: any;
	
	context: CanvasRenderingContext2D | null;
	ball: BallI;
	pad_1: PadI;
	pad_2: PadI;
	width: number;
	height: number;
	modeImg = new Image();
	cont: any;
	p1_score: number;
	p2_score: number;
	hits_p1: number;
	hits_p2: number;
	
	constructor(private liveService: LiveService,
				private location: Location,
				private sQuery: SessionStorageQueryService,
		private playService: PlayService) {
			this.width = 0;
			this.height = 0;
			console.log(this.game);
		}

	ngOnInit(): void {
		this.width = 0;
		this.height = 0;
		this.location.replaceState(this.location.path().split('?')[0], '');
		this.streaming = this.game;
	}

	ngAfterViewInit(){
		this.isStreaming = true;
		this.context = this.liveCanvas.nativeElement.getContext('2d');
		this.cont = document.getElementById("liveCanvasCtn");
		this.setModeImage();		
		if (this.cont != undefined)
		{
			this.liveCanvas.nativeElement.width = this.cont.clientWidth;
			this.liveCanvas.nativeElement.height = this.cont.clientHeight;
		}
		this.context?.clearRect(0, 0, this.liveCanvas.nativeElement.width, this.liveCanvas.nativeElement.height);
        this.startStreaming();
    }

	ngOnDestroy(): void {
		this.sndCloseStreaming(true);
	}
	
    //renders every frame cleaning and drawing the elements
	renderFrame(): void {
		this.resize();
		this.context?.clearRect(0, 0, this.liveCanvas.nativeElement.width, this.liveCanvas.nativeElement.height);
		this.context?.drawImage(this.modeImg, 0, 0, this.liveCanvas.nativeElement.width, this.liveCanvas.nativeElement.height)
		if (this.context != undefined)
			this.context.fillStyle = '#ffffff';
		this.context?.fillRect(this.ball.pos_x, this.ball.pos_y, this.ball.width, this.ball.height);
		this.context?.fillRect(this.pad_1.pos_x, this.pad_1.pos_y, this.pad_1.width, this.pad_1.height);
		this.context?.fillRect(this.pad_2.pos_x, this.pad_2.pos_y, this.pad_2.width, this.pad_2.height);
		this.context?.fillRect(this.width - 10, this.height-10, 5, 5);
		this.context?.fillRect(10, 10, 5, 5);
		this.context?.fillRect(10, this.height -10, 5, 5);
		this.context?.fillRect(this.width - 10, 10, 5, 5);
		this.animationFrame = window.requestAnimationFrame(() => {
			this.renderFrame()
		});
	}
   
	startStreaming(): void {
		this.liveService.liveDataEmitter.subscribe((data: any) => {
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
				if (this.animationFrame == undefined)
					this.renderFrame();
			}
		});
		this.streamInterval = setInterval(() => {
			this.playService.emit(ePlay.ON_START_STREAM, this.game)
		}, 20);
	}

	sndCloseStreaming(val: boolean) {
		this.liveService.emit(ePlay.ON_STOP_STREAM, this.streaming);
		this.isStreaming = false;
		this.streaming = <WaitRoomI>{};
		clearInterval(this.streamInterval);
		window.cancelAnimationFrame(this.animationFrame);
		this.context?.clearRect(0, 0, this.liveCanvas.nativeElement.width, this.liveCanvas.nativeElement.height);
		this.sndEvent.emit(val);
	}
	resize(){
		var padd_ratio_x = this.liveCanvas.nativeElement.width / this.width;
		var padd_ratio_y = this.liveCanvas.nativeElement.height / this.height;
		this.width = this.liveCanvas.nativeElement.width;
		this.height = this.liveCanvas.nativeElement.height;
		
		this.resizeVector(this.pad_1, padd_ratio_x, padd_ratio_y);
		this.resizeVector(this.pad_2, padd_ratio_x, padd_ratio_y);
		this.resizeVector(this.ball, padd_ratio_x, padd_ratio_y);
	}
	resizeVector(obj: GameMoveableI, rx: number, ry: number)
	{
		obj.width *= rx;
		obj.height *= ry;
		obj.pos_x *= rx;
		obj.pos_y *= ry;
	}
	setModeImage(){
		if (this.game.play_modes[0] == ePlayMode.CLASIC)
			this.modeImg.src = '/assets/img/play_modes/clasic_mode.png';
		else if (this.game.play_modes[0] == ePlayMode.POWER)
			this.modeImg.src = '/assets/img/play_modes/power_mode.png';
		else if (this.game.play_modes[0] == ePlayMode.ANGLE)
			this.modeImg.src = '/assets/img/play_modes/angle_mode.png';
	}
	@HostListener('window:resize', ['$event'])
	onWindowResize(event: KeyboardEvent) {
		if (this.cont != undefined)
		{
			this.liveCanvas.nativeElement.width = this.cont.clientWidth;
			this.liveCanvas.nativeElement.height = this.cont.clientHeight;
		}	
	}
}
