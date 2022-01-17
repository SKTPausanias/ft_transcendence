import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, EventEmitter } from "@angular/core";
import { Socket } from "socket.io-client";
import { ePlay } from "src/app/shared/ft_enums";
import { SessionI, SharedPreferencesI, WaitRoomI } from "src/app/shared/ft_interfaces";
import { SocketService } from "../../socket.service";

@Injectable({
	providedIn: "root",
})
export class LiveService {
	liveEventEmitter: EventEmitter<any>;

	socket: Socket; 
	sharedPreferences: SharedPreferencesI = <SharedPreferencesI>{};
	constructor(private http: HttpClient) {
		this.liveEventEmitter = new EventEmitter<any>();
		//this.socket = this.socketService.getSocket();
	}
	initGateway(socket: Socket, sharedPreference: SharedPreferencesI) {
		this.socket = socket;
		this.sharedPreferences = sharedPreference;
		this.onGetLiveGames();
	}
	private onGetLiveGames(){
		this.socket.on(ePlay.ON_GET_LIVE_GAMES, (emiter: string, data: any) => {
			try {
				console.log("onGetLiveGames liveService: ", emiter, data);
				this.liveEventEmitter.emit({games: data});
			}catch(error){}
		})
	}
	async getLiveGames(session: SessionI): Promise<any> {
		const url = "/api/users/play/liveGames";

		try{
			const ret = await (this.http.get<any>(url, { headers: new HttpHeaders({
				Authorization: 'Bearer ' + session.token})
				}).toPromise());
				return (ret);
		}catch(e){
			return ([]);
		}
	}
	emit(action: string, data?: any){
		console.log("emit from playService: ", action, data);
		data ? this.socket.emit(action, data) : this.socket.emit(action);
	}
}
