import { Injectable, EventEmitter } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { SessionI, SharedPreferencesI } from "../shared/ft_interfaces";
import { environment } from 'src/environments/environment'
import { wSocket } from 'src/app/shared/ft_enums'
import { UserPublicInfoI } from "../shared/interface/iUserInfo";

@Injectable({
	providedIn: "root",
})
export class SocketService {
	private socket: Socket;
	receivedFilter: EventEmitter<any>;
	sharedPreferences: SharedPreferencesI = <SharedPreferencesI>{};
	constructor() {
	}
	
	public connect(session : SessionI, sharedPreference: SharedPreferencesI){
		this.receivedFilter = new EventEmitter<any>();
		this.sharedPreferences = sharedPreference;
		this.init(session);
		this.onConnect();
		this.onDisonnect();
		this.onForceDisonnect();
		this.onSessionInit();
		this.onFriendConnection();
		this.onFriendInvitation();
		this.onFriendAccept();
		this.onFriendRemove();
		this.onDeleteAccount();
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
		});
	}
	private onDisonnect(){
		this.socket.on(wSocket.DISCONNECT, () => {
		});
	}
	private onForceDisonnect(){
		this.socket.on(wSocket.FORCE_DISCONNECT, (data: any) => {
			this.socket.disconnect();
		});
	}
	private onSessionInit(){
		this.socket.on(wSocket.SESSION_INIT, (data: any) => {
			data.friends.sort((a: any, b: any) => a.online > b.online ? -1 : a.online > b.online ? 1 : 0);
			this.receivedFilter.emit(data);
		});
	}
	private onFriendConnection(){
		this.socket.on(wSocket.USER_UPDATE, (emiter: any, data: any) => {
			try {
				this.sharedPreferences.friends = this.sharedPreferences.friends.map(obj => obj.nickname === emiter ? data : obj);
				this.sharedPreferences.friends.sort((a, b) => a.online > b.online ? -1 : a.online > b.online ? 1 : 0);
				this.receivedFilter.emit(this.sharedPreferences);
			} catch (error) {
				console.log("ERROR ON FRIEND CONNECT");
			}
		});
	}
	private onFriendInvitation(){
		this.socket.on(wSocket.FRIEND_INVITATION, (data: any) => {
			try {
				this.sharedPreferences.friend_invitation.push(data);
				this.receivedFilter.emit(this.sharedPreferences);
			} catch (error) {
				
			}
		})
	}
	private onFriendAccept(){
		this.socket.on(wSocket.FRIEND_ACCEPT, (data: any) => {
			try {
				this.sharedPreferences.friend_invitation = 
					this.sharedPreferences.friend_invitation.filter(obj => obj.nickname != data.nickname);
				this.sharedPreferences.friends.push(data);
				this.sharedPreferences.friends.sort((a, b) => a.online > b.online ? -1 : a.online > b.online ? 1 : 0);
				this.receivedFilter.emit(this.sharedPreferences);
			}catch(error){}
		})
		
	}
	private onFriendRemove(){
		this.socket.on(wSocket.FRIEND_DELETE, (data: any) => {
			try {
				this.sharedPreferences.friend_invitation = 
					this.sharedPreferences.friend_invitation.filter(obj => obj.nickname != data.nickname);
				this.sharedPreferences.friends = 
					this.sharedPreferences.friends.filter(obj => obj.nickname != data.nickname);
				this.receivedFilter.emit(this.sharedPreferences);
			}catch(error){}
		})
	}
	private onDeleteAccount(){
		this.socket.on(wSocket.USER_DELETE, (remiter: string, data: any) => {
			try {
				this.sharedPreferences.friend_invitation = 
					this.sharedPreferences.friend_invitation.filter(obj => obj.nickname != data.nickname);
				this.sharedPreferences.friends = 
					this.sharedPreferences.friends.filter(obj => obj.nickname != data.nickname);
				this.receivedFilter.emit(this.sharedPreferences);
			}catch(error){}
		})
	}

}
