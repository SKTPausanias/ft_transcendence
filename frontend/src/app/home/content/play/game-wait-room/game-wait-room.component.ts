import { Component, Input, OnInit, Output,EventEmitter } from '@angular/core';
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

	@Input() public player1: UserInfoI;
	@Input() public player2: UserPublicInfoI;
	@Input() public msg: String;
	@Output() passEntry: EventEmitter<any> = new EventEmitter();
	timer: string;
  constructor(public modal: NgbActiveModal, private playService: PlayService) { }

  ngOnInit(): void {
	this.startGameWaitTimer();
  }
  
  close(){
	//this.modal.close();

	this.playService.emit(ePlay.ON_PLAY_TEST, {oponent: this.player2, msg: this.player1.nickname + " pressed cancel"});
	this.passEntry.emit();
}
cancel(){
	this.playService.emit(ePlay.ON_PLAY_TEST, {oponent: this.player2, msg: this.player1.nickname + " pressed cancel"});
	this.passEntry.emit();
  }
  startGameWaitTimer()
	{
		var counter = 15;
		let intervalId = setInterval(() => {
			this.timer = counter.toString();
			this.passEntry.emit();
			if (counter-- == 0)
			{
				this.modal.dismiss();
				this.playService.emit(ePlay.ON_DECLINE_INVITATION, this.player2)
				clearInterval(intervalId)
			}
		}, 1000)
	}
}
