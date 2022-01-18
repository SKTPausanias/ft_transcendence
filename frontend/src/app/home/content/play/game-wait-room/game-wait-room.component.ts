import { Component, Input, OnInit, Output,EventEmitter, ElementRef, ViewChild, HostListener } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ePlay, eRequestPlayer } from 'src/app/shared/ft_enums';
import { WaitRoomI } from 'src/app/shared/ft_interfaces';
import { UserPublicInfoI, UserInfoI } from 'src/app/shared/interface/iUserInfo';
import { PlayService } from '../play.service';
import { mDate } from 'src/app/utils/date'
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-wait-room',
  templateUrl: './game-wait-room.component.html',
  styleUrls: ['./game-wait-room.component.css']
})
export class GameWaitRoomComponent implements OnInit {
	@Input() public waitRoom: WaitRoomI;
	@Input() public me: UserInfoI;
	@Output() waitRoomEntry: EventEmitter<any> = new EventEmitter();
	timer: string;
	lapTime: number = 60;
	showAcceptBtn= true;

	constructor(public modal: NgbActiveModal, 
		private playService: PlayService,
		private router: Router) {
	
	}

	ngOnInit(): void {
		if (this.me.login == this.waitRoom.player1.login && this.waitRoom.player1.status == eRequestPlayer.ACCEPTED)
			this.showAcceptBtn = false;
		if (this.me.login == this.waitRoom.player2.login && this.waitRoom.player2.status == eRequestPlayer.ACCEPTED)
			this.showAcceptBtn = false;
		this.startGameWaitTimer();
	}

	acceptPlay() {
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
			this.timer = "0:" + (timeLeft < 10 ? "0" :"") + timeLeft;
			this.waitRoomEntry.emit(true);
			if (counter-- == 0 ||  mDate.expired(this.waitRoom.expires) || this.isRejected())
			{
				this.modal.dismiss();
				this.playService.emit(ePlay.ON_WAIT_ROOM_REJECT, this.waitRoom)
				clearInterval(intervalId)
			}
			if (this.waitRoom.ready)
			{
				this.router.navigateByUrl('/play');
				this.modal.dismiss();
				clearInterval(intervalId);

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
