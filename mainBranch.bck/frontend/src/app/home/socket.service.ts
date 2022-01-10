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
	chatFilter: EventEmitter<any>;
	chatBlockFilter: EventEmitter<any>;
	chatMuteFilter: EventEmitter<any>;
	sharedPreferences: SharedPreferencesI = <SharedPreferencesI>{};
	constructor() {
	}
	
	public connect(session : SessionI, sharedPreference: SharedPreferencesI){
		this.receivedFilter = new EventEmitter<any>();
		this.chatFilter = new EventEmitter<any>();
		this.chatBlockFilter = new EventEmitter<any>();
		this.chatMuteFilter = new EventEmitter<any>();
		this.sharedPreferences = sharedPreference;
		this.init(session);
		this.onConnect();
		this.onDisonnect();
		this.onForceDisonnect();
		this.onSessionInit();
		this.onUserUpdate();
		this.onFriendInvitation();
		this.onFriendAccept();
		this.onFriendRemove();
		this.onDeleteAccount();
		this.onChatMessage();
		this.onGroupChatMessage();
		this.onChatBlockUser();
		this.onChatMuteUser();
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
	private onUserUpdate(){
		this.socket.on(wSocket.USER_UPDATE, (emiter: any, data: any) => {
			try {
				if (this.sharedPreferences.userInfo.login === emiter)
					this.sharedPreferences.userInfo = data;
				this.sharedPreferences.friends = this.sharedPreferences.friends.map(obj => obj.login === emiter ? data : obj);
				this.sharedPreferences.friends.sort((a, b) => a.online > b.online ? -1 : a.online > b.online ? 1 : 0);
				this.receivedFilter.emit(this.sharedPreferences);
			} catch (error) {
				console.log("ERROR ON FRIEND CONNECT");
			}
		});
	}
	private onFriendInvitation(){
		this.socket.on(wSocket.FRIEND_INVITATION, (emiter: string, data: any) => {
			try {
				const invitations = this.sharedPreferences.friend_invitation.filter(obj => obj.login.indexOf(data.login) !== -1);
				if (!invitations.length)
					this.sharedPreferences.friend_invitation.push(data);
				this.receivedFilter.emit(this.sharedPreferences);
			} catch (error) {
				
			}
		})
	}
	private onFriendAccept(){
		this.socket.on(wSocket.FRIEND_ACCEPT, (emiter: string, data: any) => {
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
		this.socket.on(wSocket.FRIEND_DELETE, (emiter: string, data: any) => {
			
			try {
				this.sharedPreferences.friend_invitation = 
					this.sharedPreferences.friend_invitation.filter(obj => obj.login != data.login);
				this.sharedPreferences.friends = 
					this.sharedPreferences.friends.filter(obj => obj.login != data.login);
				this.receivedFilter.emit(this.sharedPreferences);
			}catch(error){}
		})
	}
	private onDeleteAccount(){
		this.socket.on(wSocket.USER_DELETE, (emiter: string, data: any) => {
			try {
				this.sharedPreferences.friend_invitation = 
					this.sharedPreferences.friend_invitation.filter(obj => obj.login != emiter);
				this.sharedPreferences.friends = 
					this.sharedPreferences.friends.filter(obj => obj.login != emiter);
				this.receivedFilter.emit(this.sharedPreferences);
			}catch(error){}
		})
	}

	private onChatMessage(){
		this.socket.on(wSocket.CHAT_MESSAGE, (emiter: string, data: any) => {
			try {
				console.log("data recieved:", data);
				console.log("emiter:", emiter);
				//this.sharedPreferences.chat_messages.push(data); si descomento no llega al subscribe
				//console.log("data sent", this.sharedPreferences);
				this.chatFilter.emit(data);
			}catch(error){}
		})
	}

	private onGroupChatMessage(){
		this.socket.on(wSocket.CHAT_GROUP_MESSAGE, (emiter: string, data: any) => {
			try {
				console.log("data recieved:", data);
				console.log("emiter:", emiter);
				//this.sharedPreferences.chat_messages.push(data); si descomento no llega al subscribe
				//console.log("data sent", this.sharedPreferences);
				this.chatFilter.emit(data);
			}catch(error){}
		})
	}

	private onChatBlockUser(){
		this.socket.on(wSocket.CHAT_BLOCK_USER, (emiter: string, data: any) => {
			try {
				console.log("data recieved onChatBlockUser:", data);
				console.log("emiter:", emiter);
				this.chatBlockFilter.emit(data);
			}
			catch(error){}
		})
	}

	private onChatMuteUser(){
		this.socket.on(wSocket.CHAT_MUTE_USER, (emiter: string, data: any) => {
			try {
				console.log("data recieved onChatMuteUser:", data);
				console.log("emiter:", emiter);
				this.chatMuteFilter.emit(data);
			}
			catch(error){}
		})
	}

	emit(action: string, data?: any){
		data ? this.socket.emit(action, data) : this.socket.emit(action);
	}

	public getSocket():Socket {
		return this.socket;
	}
/* 	emitWithData()
	emitUserUpdate(){
		this.socket.emit(wSocket.USER_UPDATE);
	}

	emitFriendInvitation(user: any){
		this.socket.emit(wSocket.FRIEND_INVITATION, user);
	} */


}
