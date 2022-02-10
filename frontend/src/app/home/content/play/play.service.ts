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
	waitRoomEmiter: EventEmitter<any>;
	liveDataEmiter: EventEmitter<any>;
	gameDataEmiter: EventEmitter<any>;
	gameWinnerEmiter: EventEmitter<any>;
	matchMakingEmiter: EventEmitter<any>;
	private socket: Socket;
	sharedPreferences: SharedPreferencesI = <SharedPreferencesI>{};
	constructor(private http: HttpClient) {
		this.playEmiter = new EventEmitter<any>();
		this.waitRoomEmiter = new EventEmitter<any>();
		this.liveDataEmiter = new EventEmitter<any>();
		this.gameDataEmiter = new EventEmitter<any>();
		this.gameWinnerEmiter = new EventEmitter<any>();
		this.matchMakingEmiter = new EventEmitter<any>();
	}

	initGateway(socket: Socket, sharedPreference: SharedPreferencesI) {
		this.socket = socket;
		this.sharedPreferences = sharedPreference;
		this.onLoadAllGameInvitations();
		this.onRequestInvitation();
		this.onAcceptInvitation();
		this.onDeclineInvitation();
		this.onWaitRoomReject();
		this.onWaitRoomAccept();
		this.onSelectPlayMode();
		this.onLoadActiveWaitRoom();
		this.onMatchData();
		this.onStartGame();
		this.onGameMoving();
		this.onWinGame();
		/* this.onPaddleMove(); */
	}

	private onLoadAllGameInvitations(){
		this.socket.on(ePlay.ON_LOAD_ALL_GAME_INVITATIONS, (emiter: string, data: any) => {
			try {
				this.playEmiter.emit({allInvitations: data});
			}catch(error){}
		})
	}
	private onLoadActiveWaitRoom(){ ///Change test name for another more convenient
		this.socket.on(ePlay.ON_LOAD_ACTIVE_WAIT_ROOM, (data: any) => {
			try {
				this.playEmiter.emit({acceptation: data});
			}catch(error){}
		})
	}
	private onRequestInvitation(){
		this.socket.on(ePlay.ON_REQUEST_INVITATION, (emiter: string, data: any) => {
			try {
				this.playEmiter.emit({invitation: data});
			}catch(error){}
		})
	}
	private onDeclineInvitation(){
		this.socket.on(ePlay.ON_DECLINE_INVITATION, (data: any) => {
			try {
				this.playEmiter.emit({declination: data});
			}catch(error){}
		})
	}
	private onAcceptInvitation(){
		this.socket.on(ePlay.ON_ACCEPT_INVITATION, (emiter: string, data: any) => {
			try {
				this.playEmiter.emit({acceptation: data});
			}catch(error){}
		})
	}
	private onWaitRoomReject(){ ///Change test name for another more convenient
		this.socket.on(ePlay.ON_WAIT_ROOM_REJECT, (emiter: string, data: any) => {
			try {
				this.playEmiter.emit({waitRoomStatus: data});
			}catch(error){}
		})
	}
	private onWaitRoomAccept(){ ///Change test name for another more convenient
		this.socket.on(ePlay.ON_WAIT_ROOM_ACCEPT, (emiter: string, data: any) => {
			try {
				this.playEmiter.emit({waitRoomStatus: data});
				//connect to new game socket 
			}catch(error){}
		})
	}

	private onSelectPlayMode(){ ///Change test name for another more convenient
		this.socket.on(ePlay.ON_SELECT_PLAY_MODE, (emiter: string, data: any) => {
			try {
				this.waitRoomEmiter.emit(data);
				//connect to new game socket 
			}catch(error){}
		})
	}
	private onMatchData(){ ///Change test name to another more convenient
		this.socket.on(ePlay.ON_MATCH_DATA, (emiter: string, data: any) => {
			try {
				this.gameDataEmiter.emit(data);
				this.liveDataEmiter.emit(data);
			}catch(error){}
		})
	}

	private onStartGame() {
		this.socket.on(ePlay.ON_START_GAME, (data: any) => {
			try {
				this.gameDataEmiter.emit(data);
			}catch(error){}
		})
	}
	private onGameMoving() {
		this.socket.on(ePlay.ON_GAME_MOVING, (data: any) => {
			try {
				this.gameDataEmiter.emit(data);
			}catch(error){}
		})
	}

	private onWinGame(){
		this.socket.on(ePlay.ON_GAME_WINNER, (emiter: string, data: any) => {
			try {
				this.gameWinnerEmiter.emit(data);
			}catch(error){}
		})
	}
	

	emit(action: string, data?: any){
		data ? this.socket.emit(action, data) : this.socket.emit(action);
	}
}