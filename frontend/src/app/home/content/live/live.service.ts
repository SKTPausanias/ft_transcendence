import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, EventEmitter } from "@angular/core";
import { Socket } from "socket.io-client";
import { SessionI, WaitRoomI } from "src/app/shared/ft_interfaces";
import { SocketService } from "../../socket.service";

@Injectable({
	providedIn: "root",
})
export class LiveService {
	liveEventEmitter: EventEmitter<any>;

	socket: Socket; 
	constructor(private socketService: SocketService
		, private http: HttpClient) {
		this.liveEventEmitter = new EventEmitter<any>();
		this.socket = this.socketService.getSocket();
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
}
