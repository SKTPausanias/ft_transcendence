import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { SessionI } from "../shared/ft_interfaces";
import { environment } from 'src/environments/environment'
import { wSocket } from 'src/app/shared/ft_enums'

@Injectable({
	providedIn: "root",
})
export class SocketService {
	private socket: Socket;
	constructor() {}

	public connect(session : SessionI){
		this.init(session);
		this.onConnect();
		this.onDisonnect();
		this.onForceDisonnect();
		this.onFriendConnect();
		this.onFriendDisconnect();

		this.onTest();
		
	}
	public disconnect()
	{
		this.socket.disconnect();
	}

	private init(session: SessionI){
		this.socket = io(environment.server_ws_uri,{
			transportOptions: {
				polling: {
					extraHeaders: {
						'Authorization' : 'Bearer ' + session.token
					}
				}
			}
		});
	}
	private onConnect(){
		this.socket.on(wSocket.CONNECT, () => {
			console.log('connection established!');
			//this.socket.disconnect();
		});
	}
	private onDisonnect(){
		this.socket.on(wSocket.DISCONNECT, (data: any) => {
			console.log('disconnected! ', data);
		});
	}
	private onForceDisonnect(){
		this.socket.on(wSocket.FORCE_DISCONNECT, (data: any) => {
			this.socket.disconnect();
		});
	}
	private onFriendConnect(){
		this.socket.on(wSocket.FRIEND_CONNECT, (data: any) => {
			this.socket.emit(wSocket.FRIEND_CONNECT, "FRIEND_CONNECT recived");
			console.log(data);
		});
	}
	private onFriendDisconnect(){
		this.socket.on(wSocket.FRIEND_DISCONNECT, (data: any) => {
			this.socket.emit(wSocket.FRIEND_DISCONNECT, "FRIEND_DISCONNECT recived");
			console.log(data);
		});
	}
	private onTest(){
		this.socket.on(wSocket.TEST, (data: any) => {
			this.socket.emit(wSocket.TEST, "Test recived");
			console.log(data);
		});
	}
}
