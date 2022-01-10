import { Injectable, EventEmitter } from "@angular/core";
import { Socket } from "socket.io-client";
import { SocketService } from "../../socket.service";

@Injectable({
	providedIn: "root",
})
export class LiveService {
	liveEventEmitter: EventEmitter<any>;

	socket: Socket; 
	constructor(private socketService: SocketService) {
		this.liveEventEmitter = new EventEmitter<any>();
		this.socket = this.socketService.getSocket();
	}
	
}
