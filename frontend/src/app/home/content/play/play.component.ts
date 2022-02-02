import { Component, OnInit, Input } from "@angular/core";
import { SharedPreferencesI, WaitRoomI } from "src/app/shared/ft_interfaces";
import { PlayService } from "./play.service";
import { Router } from "@angular/router";
import { ePlay } from "src/app/shared/ft_enums";
import { GameI } from "src/app/shared/interface/iPlay";

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

	ngOnInit(): void {
		this.playService.gameWinnerEmiter.subscribe((data: any) => {
			console.log("Winner from playComponent", data);
		});
	}

	ngOnDestroy(): void {
	}
	rcvWinner(game: GameI){
		if (game.gameFinished)
			this.cancelGame(game);
	}
	cancelGame(game: GameI){
		this.playService.emit(ePlay.ON_GAME_END, {wRoom: this.playPreference.game, game: game});
		if (game.score_p1 > game.score_p2)
			this.playService.emit(ePlay.ON_GAME_WINNER, {winner: this.playPreference.game.player1, loser: this.playPreference.game.player2});
		else
			this.playService.emit(ePlay.ON_GAME_WINNER, {winner: this.playPreference.game.player2, loser: this.playPreference.game.player1});
		this.playPreference.game = <WaitRoomI>{};
	}
	matchMaking(): void {
		this.playService.emit(ePlay.ON_MATCH_MAKING)
	}
	cancelMatchMaking(): void {
		this.playService.emit(ePlay.ON_CANCEL_MATCH_MAKING);
	}
}
