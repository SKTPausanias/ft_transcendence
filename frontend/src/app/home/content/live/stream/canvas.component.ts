import { Component, ElementRef, Input, OnInit, Output, ViewChild, EventEmitter } from "@angular/core";
import { ePlay } from "src/app/shared/ft_enums";
import { WaitRoomI } from "src/app/shared/ft_interfaces";
import { SessionStorageQueryService } from "src/app/shared/ft_services";
import { BallI, PadI } from "src/app/shared/interface/iPlay";
import { PlayService } from "../../play/play.service";
import { LiveService } from "../live.service";
import { Location } from '@angular/common';

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
	
	constructor(private liveService: LiveService,
				private location: Location,
				private sQuery: SessionStorageQueryService,
		private playService: PlayService) {
			this.streaming = this.game;
			this.width = 0;
			this.height = 0;
		}

	ngOnInit(): void {
		this.width = 0;
		this.height = 0;
		this.location.replaceState(this.location.path().split('?')[0], '');
	}

	ngAfterViewInit(){
		this.isStreaming = true;
		this.context = this.liveCanvas.nativeElement.getContext('2d');
		this.context?.clearRect(0, 0, this.liveCanvas.nativeElement.width, this.liveCanvas.nativeElement.height);
        this.startStreaming();
    }

	ngOnDestroy(): void {
		this.sndCloseStreaming(true);
	}
	
    //renders every frame cleaning and drawing the elements
    renderFrame(): void {
		this.context?.clearRect(0, 0, this.liveCanvas.nativeElement.width, this.liveCanvas.nativeElement.height);
		this.context?.fillRect(this.ball.pos_x, this.ball.pos_y, this.ball.width, this.ball.height);
		this.context?.fillRect(this.pad_1.pos_x, this.pad_1.pos_y, this.pad_1.width, this.pad_1.height);
		this.context?.fillRect(this.pad_2.pos_x, this.pad_2.pos_y, this.pad_2.width, this.pad_2.height);
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
}
