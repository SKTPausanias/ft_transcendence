import { Component, Input, OnInit, Output,EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ePlay, eRequestPlayer } from 'src/app/shared/ft_enums';
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
	@ViewChild("ready") ready: ElementRef<HTMLInputElement>;
	@ViewChild("reject") reject: ElementRef<HTMLInputElement>;
	@Input() public waitRoom: WaitRoomI;
	@Input() public me: UserInfoI;
	@Output() waitRoomEntry: EventEmitter<any> = new EventEmitter();
	timer: string;
	lapTime: number = 60;

	constructor(public modal: NgbActiveModal, private playService: PlayService) {
	
	}

	ngOnInit(): void {
		console.log("onInit(): ", this.waitRoom);
		this.startGameWaitTimer();
	}

	acceptPlay() {
		this.reject.nativeElement.hidden = true;
		this.changeMyStatus(eRequestPlayer.ACCEPTED);
		this.playService.emit(ePlay.ON_WAIT_ROOM_ACCEPT, this.waitRoom);
	}

	rejectPlay(){
		this.changeMyStatus(eRequestPlayer.REJECTED);
		this.playService.emit(ePlay.ON_WAIT_ROOM_REJECT, this.waitRoom);
	}

	startGameWaitTimer() {
		var counter = 10000;
		let intervalId = setInterval(() => {
			var timeLeft = (this.waitRoom.expires - mDate.timeNowInSec());
			timeLeft < 0 ? (timeLeft = 0) : 0;
			this.timer = "" + timeLeft;
			this.waitRoomEntry.emit(true);
			if (counter-- == 0 ||  mDate.expired(this.waitRoom.expires) || this.isRejected())
			{
				this.modal.dismiss();
				this.playService.emit(ePlay.ON_DECLINE_INVITATION, this.waitRoom.player2)
				clearInterval(intervalId)
			}
		}, 100)
	}
	private changeMyStatus(status: string)
	{
		if (this.waitRoom.player1.login == this.me.login)
			this.waitRoom.player1.status = status;
		else
			this.waitRoom.player2.status = status;
	}
	private isRejected()
	{
		if (this.waitRoom.player1.status == eRequestPlayer.REJECTED ||
			this.waitRoom.player2.status == eRequestPlayer.REJECTED)
			return (true);
		return (false);
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