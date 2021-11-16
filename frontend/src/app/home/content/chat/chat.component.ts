import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { ChatService } from './chat.service';
import { SocketService } from '../../socket.service';
import { SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { mDate } from 'src/app/utils/date';
import { Messages } from 'src/app/shared/class/cMessages';
import { ChannelI } from 'src/app/shared/interface/iChat';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @Input() chatPreference: SharedPreferencesI;
  showChannels: boolean = true;
  showDM : boolean = true;
  identifier: String = 'Juan';
  channs: String[] = ["random-chanel", "info", "tournoments","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff","other_stuff"]
  directMsg: String[] = ["Juan", "Pepe", "Paco","Fran" ]
	constructor(
  ){}
  
  ngOnInit(){}

  hideShowChannels(){
	this.showChannels ? (this.showChannels = false) : (this.showChannels = true);
  }
  hideShowDM(){
	this.showDM ? (this.showDM = false) : (this.showDM = true);
  }
  setIndentifier(item: any){
	  this.identifier = item;
  }
}