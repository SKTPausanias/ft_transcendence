import { Component, Input, OnInit, Output,EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ePlay } from 'src/app/shared/ft_enums';
import { UserPublicInfoI, UserInfoI } from 'src/app/shared/interface/iUserInfo';
import { PlayService } from '../play.service';

@Component({
  selector: 'app-game-wait-room',
  templateUrl: './game-wait-room.component.html',
  styleUrls: ['./game-wait-room.component.css']
})
export class GameWaitRoomComponent implements OnInit {
	@ViewChild('ready') readyElement: ElementRef<HTMLInputElement>;
	@Input() public player1: UserInfoI;
	@Input() public player2: UserPublicInfoI;
	@Input() public msg: String;
	@Output() passEntry: EventEmitter<any> = new EventEmitter();
	timer: string;
	lapTime: number = 60;

	constructor(public modal: NgbActiveModal, private playService: PlayService) {
	
	}

	ngOnInit(): void {
		this.startGameWaitTimer();
	}

	readyPlay() {
		this.playService.emit(ePlay.ON_PLAY_READY, {oponent: this.player2, msg: this.player1.nickname + " Let's get bussy!!"/* , ready: this.readyElement */});
		this.passEntry.emit();
	}

	rejectPlay(){
		this.playService.emit(ePlay.ON_PLAY_READY, {oponent: this.player2, msg: this.player1.nickname + " Match rejected"});
		this.passEntry.emit(true); //see what this is
		this.playService.emit(ePlay.ON_DECLINE_INVITATION, this.player2) //set the player who clicks on reject
		this.lapTime = 0;
	}

	startGameWaitTimer() {
		var counter = this.lapTime;
		let intervalId = setInterval(() => {
			this.timer = counter.toString();
			this.passEntry.emit();
			if (counter-- == 0 || this.lapTime == 0)
			{
				
				this.modal.dismiss();
				this.playService.emit(ePlay.ON_DECLINE_INVITATION, this.player2)
				clearInterval(intervalId)
			}
		}, 1000)
	}
}
