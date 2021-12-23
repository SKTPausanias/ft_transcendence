import { Component, OnInit, Input } from '@angular/core';
import { SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { PlayService } from './play.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css']
})
export class PlayComponent implements OnInit {
  @Input() playPreference: SharedPreferencesI;
  constructor(
    private router: Router,
    private playService: PlayService,
  ) { }

  ngOnInit(): void {
    console.log(this.playPreference);
    this.playService.playEmiter.subscribe(
      (data) => {
        console.log("on subscribe", data);
        this.router.navigateByUrl('/play');
        this.start_game();
        //this.playPreference.in_game = false;
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

}
