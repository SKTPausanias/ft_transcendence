import { Component, OnInit, Input } from "@angular/core";
import { SharedPreferencesI, WaitRoomI } from "src/app/shared/ft_interfaces";
import { PlayService } from "./play.service";
import { Router } from "@angular/router";
import { ePlay } from "src/app/shared/ft_enums";

@Component({
	selector: "app-play",
	templateUrl: "./play.component.html",
	styleUrls: ["./play.component.css"],
})
export class PlayComponent implements OnInit {
	@Input() playPreference: SharedPreferencesI;
	constructor(private router: Router, private playService: PlayService) {
	//
	}

	ngOnInit(): void {}

	ngOnDestroy(): void {
	}
	rcvWinner(val: boolean){
		if (val)
			this.cancelGame();
	}
	cancelGame(){
		this.playService.emit(ePlay.ON_GAME_END, this.playPreference.game);
		this.playPreference.game = <WaitRoomI>{};
	}
}
