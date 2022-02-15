import { Component, OnInit, Input } from "@angular/core";
import { SharedPreferencesI, UserInfoI, WaitRoomI } from "src/app/shared/ft_interfaces";
import { PlayService } from "./play.service";
import { Router } from "@angular/router";
import { ePlay } from "src/app/shared/ft_enums";
import { GameI } from "src/app/shared/interface/iPlay";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ResultModalComponent } from "./modal/result-modal.component";
import { SystemInfoI } from "src/app/shared/interface/iDash";

@Component({
	selector: "app-play",
	templateUrl: "./play.component.html",
	styleUrls: ["./play.component.css"],
})
export class PlayComponent implements OnInit {
	@Input() playPreference: SharedPreferencesI;
	waiting: boolean = false;
	btnTxt: string = "Quick Play";
	gameWinnerEmiter: any;
	matchMakingEmiter: any;
	infoSystemEmitter: any;
	infoSystem: SystemInfoI;
	constructor(private playService: PlayService,
				private modalService: NgbModal) {
		this.infoSystem = <SystemInfoI>{};
		this.infoSystem.total_users = 0;
		this.infoSystem.online_users = 0;
		this.infoSystem.in_game_users = 0;
	}

	ngOnInit(): void {
		this.gameWinnerEmiter = this.playService.gameWinnerEmiter.subscribe((data: any) => {
			if (data.showModal == true)
				this.openModal(data.message, this.playPreference);
		});
		this.matchMakingEmiter = this.playService.matchMakingEmiter.subscribe((data: any) => {
			console.log("Wait ROOm emiter", data);
			this.waiting = false;
			this.btnTxt = "Quick Play";
		});
		this.infoSystemEmitter = this.playService.getInfoSystemEmitter.subscribe((data: any) => {
			this.infoSystem = data;
		});
		this.playService.emit(ePlay.ON_GET_INFO_SYSTEM);
		
	}
	ngAfterViewInit(){
		//this.openModal("Hola !!!", this.playPreference);
	}
	
	ngOnDestroy(): void {
		this.gameWinnerEmiter.unsubscribe();
		this.matchMakingEmiter.unsubscribe();
		this.infoSystemEmitter.unsubscribe();
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
		this.waiting ? this.playService.emit(ePlay.ON_CANCEL_MATCH_MAKING) : this.playService.emit(ePlay.ON_MATCH_MAKING);
		this.waiting = this.waiting != true;
		this.btnTxt = !this.waiting ? "Quick Play" : "Cancel";

	}
	cancelMatchMaking(): void {
	}
	openModal(message: string, preferences: SharedPreferencesI) {
		const modal = this.modalService.open(ResultModalComponent, {
		  centered: false,
		  animation: true,
		});
		modal.componentInstance.message = message;
		modal.componentInstance.preferences = preferences;
	}
}
