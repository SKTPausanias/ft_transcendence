import { Component, Input, OnInit, Output,EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ePlay } from 'src/app/shared/ft_enums';
import { WaitRoomI } from 'src/app/shared/ft_interfaces';
import { UserPublicInfoI, UserInfoI } from 'src/app/shared/interface/iUserInfo';
import { PlayService } from '../play.service';
import { mDate } from 'src/app/utils/date'

@Component({
  selector: 'app-game-wait-room',
  templateUrl: './game-wait-room.component.html',
  styleUrls: ['./game-wait-room.component.css']
})
export class GameWaitRoomComponent implements OnInit {
	@ViewChild('ready') readyElement: ElementRef<HTMLInputElement>;
	@Input() public waitRoom: WaitRoomI;
	@Output() waitRoomEntry: EventEmitter<any> = new EventEmitter();
	timer: string;
	lapTime: number = 60;

	constructor(public modal: NgbActiveModal, private playService: PlayService) {
	
	}

	ngOnInit(): void {
		console.log("onInit(): ", this.waitRoom);
		this.startGameWaitTimer();
	}

	readyPlay() {
		//this.playService.emit(ePlay.ON_PLAY_READY, {oponent: this.player2, status: this.player1.nickname + " Let's get bussy!!"/* , ready: this.readyElement */});
		//this.waitRoomEntry.emit(false);
	}

	rejectPlay(){
		//this.playService.emit(ePlay.ON_WAIT_ROOM_REJECT, {oponent: this.player2, status: this.player1.nickname + " Match rejected"});
		//this.waitRoomEntry.emit(false); //see what this is
		this.playService.emit(ePlay.ON_DECLINE_INVITATION, this.waitRoom.player2) //set the player who clicks on reject
		//this.lapTime = 0;
	}

	startGameWaitTimer() {
		var counter = 10000;
		let intervalId = setInterval(() => {
			var timeLeft = (this.waitRoom.expires - mDate.timeNowInSec());
			timeLeft < 0 ? (timeLeft = 0) : 0;
			this.timer = "" + timeLeft;
			this.waitRoomEntry.emit(true);
			mDate
			if (counter-- == 0 ||  mDate.expired(this.waitRoom.expires))
			{
				this.modal.dismiss();
				this.playService.emit(ePlay.ON_DECLINE_INVITATION, this.waitRoom.player2)
				clearInterval(intervalId)
			}
		}, 100)
	}
}
/**
 {
	wait_room {
		player1: player,
		player2: player,
		expires : number
	}
	player = {
		id: number,
		nickname: string,
		avatar: string,
		status: waiting | accepted | rejected
	}


 }
 */