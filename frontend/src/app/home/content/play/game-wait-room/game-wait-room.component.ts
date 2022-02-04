import { Component, Input, OnInit, Output,EventEmitter, ElementRef, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ePlay, eRequestPlayer } from 'src/app/shared/ft_enums';
import { WaitRoomI } from 'src/app/shared/ft_interfaces';
import { UserPublicInfoI, UserInfoI } from 'src/app/shared/interface/iUserInfo';
import { PlayService } from '../play.service';
import { mDate } from 'src/app/utils/date'
import { Router } from '@angular/router';
import { ePlayMode } from 'src/app/shared/enums/ePlay';

@Component({
  selector: 'app-game-wait-room',
  templateUrl: './game-wait-room.component.html',
  styleUrls: ['./game-wait-room.component.css']
})
export class GameWaitRoomComponent implements OnInit, OnDestroy {
	@Input() public waitRoom2: WaitRoomI;
	@Input() public me: UserInfoI;
	@Output() waitRoomEntry: EventEmitter<any> = new EventEmitter();
	timer: string;
	lapTime: number = 60;
	showAcceptBtn= true;
	playEmiter: any;
	playModeEmiter: any;
	selecting: string;
	waitRoom: WaitRoomI = <WaitRoomI>{};
	modes: any = [
		{mode: ePlayMode.CLASIC, name: "Clasic", available: true}, 
		{mode : ePlayMode.POWER, name: "Power", available: true},
		{mode : ePlayMode.ANGLE, name: "Angle", available: true}
	];

	constructor(public modal: NgbActiveModal, 
		private playService: PlayService,
		private router: Router) {
		this.waitRoom = this.waitRoom2;
	}

	ngOnInit(): void {
		console.log(this.waitRoom);
		this.setPlayerStatus();
		this.setPlayModes();
		this.startGameWaitTimer();
		this.playEmiter = this.playService.playEmiter.subscribe((data: any) => {
			console.log("playEmiter: ", data);
			if (data.waitRoomStatus != undefined)
			{
				console.log("waitRoomStatus != undefined: ", data);

				this.waitRoom = data.waitRoomStatus;
				this.selecting = this.waitRoom.selecting;
				this.setPlayerStatus();
			}
		})
		this.playModeEmiter = this.playService.waitRoomEmiter.subscribe((data: any) => {
			console.log("playModeEmiter: ", data);
			if (data != undefined)
			{
				this.waitRoom = data;
				this.selecting = this.waitRoom.selecting;
				this.setPlayModes();
			}
		})

	}
	ngOnDestroy(): void {
		this.playEmiter.unsubscribe();
		this.playModeEmiter.unsubscribe();
	}

	acceptPlay() {
		this.changeMyStatus(eRequestPlayer.ACCEPTED);
		this.playService.emit(ePlay.ON_WAIT_ROOM_ACCEPT, this.waitRoom);
		this.showAcceptBtn = false;
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
			this.waitRoomEntry.emit(this.waitRoom);
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
	selectMode(pos: number){
		if (this.waitRoom.selecting == this.me.nickname && this.modes[pos].available)
			this.playService.emit(ePlay.ON_SELECT_PLAY_MODE, {id: this.waitRoom.id, mode: this.modes[pos].mode})
	}
	setPlayerStatus(){
		if (this.me.login == this.waitRoom.player1.login && this.waitRoom.player1.status == eRequestPlayer.ACCEPTED)
			this.showAcceptBtn = false;
		if (this.me.login == this.waitRoom.player2.login && this.waitRoom.player2.status == eRequestPlayer.ACCEPTED)
			this.showAcceptBtn = false;
	}
	setPlayModes(){
		console.log("now selecting: ", this.waitRoom.selecting);
		for (let i = 0; i < this.modes.length; i++) {
			this.modes[i].available = false;
			for (let j = 0; j < this.waitRoom.play_modes.length; j++)
				if (this.modes[i].mode == this.waitRoom.play_modes[j])
					this.modes[i].available = true;
		}
	}
}
