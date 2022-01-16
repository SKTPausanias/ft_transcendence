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
		this.onLoadAllGameInvitations();
		this.onRequestInvitation();
		this.onAcceptInvitation();
		this.onDeclineInvitation();
		this.onWaitRoomReject();
		this.onWaitRoomAccept();
		this.onLoadActiveWaitRoom();
	}

	private onLoadAllGameInvitations(){
		this.socket.on(ePlay.ON_LOAD_ALL_GAME_INVITATIONS, (emiter: string, data: any) => {
			try {
				console.log("onLoadAllGameInvitations from playService: ", emiter, data);
				this.playEmiter.emit({allInvitations: data});
			}catch(error){}
		})
	}
	private onLoadActiveWaitRoom(){ ///Change test name for another more convenient
		this.socket.on(ePlay.ON_LOAD_ACTIVE_WAIT_ROOM, (data: any) => {
			try {
				console.log("onWaitRoomAccept(): ", data);
				this.playEmiter.emit({acceptation: data});
			}catch(error){}
		})
	}
	private onRequestInvitation(){
		this.socket.on(ePlay.ON_REQUEST_INVITATION, (emiter: string, data: any) => {
			try {
				console.log("onRequestInvitation from playService: ", emiter, data);
				this.playEmiter.emit({invitation: data});
			}catch(error){}
		})
	}
	private onDeclineInvitation(){
		this.socket.on(ePlay.ON_DECLINE_INVITATION, (data: any) => {
			try {
				console.log("onDeclineInvitation from playService: ", data);
				this.playEmiter.emit({declination: data});
			}catch(error){}
		})
	}
	private onAcceptInvitation(){
		this.socket.on(ePlay.ON_ACCEPT_INVITATION, (emiter: string, data: any) => {
			try {
				console.log("onAcceptInvitation from playService: ", data);
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
				console.log("onWaitRoomAccept(): ", data);
				this.playEmiter.emit({waitRoomStatus: data});
			}catch(error){}
		})
	}
	emit(action: string, data?: any){
		console.log("emit from playService: ", action, data);
		data ? this.socket.emit(action, data) : this.socket.emit(action);
	}
}