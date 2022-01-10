import { Component, OnInit, Input } from '@angular/core';
import { SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { PlayService } from './play.service';
import { Router } from '@angular/router';
import { iGame, iPlayer } from 'src/app/shared/interface/iGame';
import { ePlay } from 'src/app/shared/ft_enums';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css']
})
export class PlayComponent implements OnInit {
  @Input() playPreference: SharedPreferencesI;
  gameInfo: iGame = <iGame>{
    player1: <iPlayer>{
      winner : false,
    },
    player2: <iPlayer>{
      winner : false,
    }
  };
  constructor(
    private router: Router,
    private playService: PlayService,
  ) { }


  ngOnInit(): void {
    console.log(this.playPreference);
    this.playService.playEmiter.subscribe(
      (data) => {
        if (data.game.finished !== undefined){
          alert("Game finished");
        }
        else
        {
          console.log("on subscribe", data);
          this.gameInfo.player1.login = data.game.player1.login;
          this.gameInfo.player1.nickname = data.game.player1.nickname;
          this.gameInfo.player2.login = data.game.player2.login;
          this.gameInfo.player2.nickname = data.game.player2.nickname;
          console.log("this.gameinfo", this.gameInfo);
          this.router.navigateByUrl('/play');
          this.start_game();
          //this.playPreference.in_game = false;
        }
      }
    );
  }

  search_game(){
    console.log("searching game");
  }

  start_game(){
    this.playPreference.in_game = true;
    //create pong game
    console.log("starting game");
    //draw pong game
    
  }

  winplayer1(){
    this.gameInfo.player1.winner = true;
    this.gameInfo.player2.winner = false;
    console.log("gameInfo", this.gameInfo);
    this.playService.emit(ePlay.ON_STOP_PLAY, {game: this.gameInfo});
  }

  winplayer2(){
    this.gameInfo.player2.winner = true;
    this.gameInfo.player1.winner = false;
    this.playService.emit(ePlay.ON_STOP_PLAY, {game: this.gameInfo});
  }

}
