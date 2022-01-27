import { HttpClient } from "@angular/common/http";
import { Injectable, EventEmitter } from "@angular/core";
import { Socket } from "socket.io-client";
import { ePlay } from "src/app/shared/ft_enums";
import { SessionI, SharedPreferencesI } from "src/app/shared/ft_interfaces";
import { UserPublicInfoI } from "src/app/shared/interface/iUserInfo";

@Injectable({
	providedIn: "root",
})
export class LiveService {
	liveEventEmitter: EventEmitter<any>;
	liveDataEmitter: EventEmitter<any>;

	socket: Socket; 
	sharedPreferences: SharedPreferencesI = <SharedPreferencesI>{};
	constructor(private http: HttpClient) {
		this.liveEventEmitter = new EventEmitter<any>();
		this.liveDataEmitter = new EventEmitter<any>();
	}
	initGateway(socket: Socket, sharedPreference: SharedPreferencesI) {
		this.socket = socket;
		this.sharedPreferences = sharedPreference;
		this.onGetLiveGames();
		this.onGameEnd();
		this.onGameStream();
	}
	private onGetLiveGames(){
		this.socket.on(ePlay.ON_GET_LIVE_GAMES, (emiter: string, data: any) => {
			try {
				this.liveEventEmitter.emit({games: data});
			}catch(error){}
		})
	}
	private onGameEnd(){
		this.socket.on(ePlay.ON_GAME_END, (emiter: string, data: any) => {
			try {
				this.liveEventEmitter.emit({game_end: data});
			}catch(error){}
		})
	}
	private onGameStream(){
		this.socket.on(ePlay.ON_START_STREAM, (data: any) => {
			try {
				this.liveDataEmitter.emit(data);
			}catch(error){}
		})
	}
	async watchLive(session: SessionI, user: UserPublicInfoI): Promise<any> {
		const url = "/api/users/play/watchLive";

		try{
			try{
				const response = await this.http.post<any>(url, {token : session.token, user : user}).toPromise();
				return (response);
			}catch(e){
				return ([]);
			}
		}catch(e){
			return ([]);
		}
	}
	emit(action: string, data?: any){
		data ? this.socket.emit(action, data) : this.socket.emit(action);
	}
}
