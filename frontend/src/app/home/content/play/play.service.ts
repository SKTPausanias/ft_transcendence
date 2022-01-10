import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable, EventEmitter } from "@angular/core";
import { Socket } from "socket.io-client";
import { ePlay, Nav } from "src/app/shared/ft_enums";
import { ChatI, ChatPasswordUpdateI, ChatRoomI, RoomKeyI, SessionI, SharedPreferencesI } from "src/app/shared/ft_interfaces";
import { UserPublicInfoI } from "src/app/shared/interface/iUserInfo";
import { SocketService } from "../../socket.service";

@Injectable({providedIn: "root"})
export class PlayService {
	playEmiter: EventEmitter<any>;
	private socket: Socket;
	sharedPreferences: SharedPreferencesI = <SharedPreferencesI>{};
	constructor(private http: HttpClient) {
		this.playEmiter = new EventEmitter<any>();
	}

	initGateway(socket: Socket, sharedPreference: SharedPreferencesI) {
		this.socket = socket;
		this.sharedPreferences = sharedPreference;
		this.onRequestInvitation();
		this.onStartGame();
		this.onStopGame();
	}

	private onRequestInvitation(){
		this.socket.on(ePlay.ON_REQUEST_INVITATION, (emiter: string, data: any) => {
			try {
				console.log("onRequestInvitation from playService: ", emiter, data);
				this.playEmiter.emit({invitation: data});
			}catch(error){}
		})
	}

	private onStartGame(){
		this.socket.on(ePlay.ON_START_PLAY, (emiter: string, data: any) => {
			try {
				console.log("onStartGame", emiter, data);
				this.playEmiter.emit({game: data});
			}catch(error){}
		})
	}

	private onStopGame(){
		this.socket.on(ePlay.ON_STOP_PLAY, (emiter: string, data: any) => {
			try {
				console.log("onStopGame", emiter, data);
				this.playEmiter.emit({game: data});
			}catch(error){}
		})
	}

	emit(action: string, data?: any){
		console.log("emit", action, data);
		data ? this.socket.emit(action, data) : this.socket.emit(action);
	}

	playPongInvitation(oponent: UserPublicInfoI): void {
		alert("Waiting for oponent..." + oponent.nickname);
	}
}