import { Injectable, EventEmitter } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { SessionI, SharedPreferencesI } from "../shared/ft_interfaces";
import { environment } from 'src/environments/environment'
import { wSocket } from 'src/app/shared/ft_enums'
import { UserPublicInfoI } from "../shared/interface/iUserInfo";
import { Router } from "@angular/router";

@Injectable({
	providedIn: "root",
})
export class SocketService {
	private socket: Socket;
	receivedFilter: EventEmitter<any>;
	chatEmiter: EventEmitter<any>;
	sharedPreferences: SharedPreferencesI = <SharedPreferencesI>{};
	constructor(private router: Router) {
	}
	
	public connect(session : SessionI, sharedPreference: SharedPreferencesI){
		this.receivedFilter = new EventEmitter<any>();
		this.chatEmiter = new EventEmitter<any>();
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
		this.onStartChat();
		this.onChatLoadAllMessages();
		this.onNewChatMsg();
		this.onJoinRoom();
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
			console.log("on update", data);
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

	private onStartChat(){
		this.socket.on(wSocket.ON_START, (emiter: string, data: any) => {
			try {
				//console.log(emiter, ":", data);
				if (this.sharedPreferences.chat.rooms.find(chat => chat.id == data.id) == undefined)
					this.sharedPreferences.chat.rooms.push(data);
				this.sharedPreferences.chat.active_room = data;
				this.receivedFilter.emit(this.sharedPreferences);
				this.chatEmiter.emit({action: 'open', room : data});

			}catch(error){}
		})
	}
	/* private onStartChat(){
		this.socket.on(wSocket.CHAT_ON_START, (emiter: string, data: any) => {
			try {
				console.log(data);
				if (this.sharedPreferences.chat.rooms.find(chat => chat.id == data.id) == undefined)
					this.sharedPreferences.chat.rooms.push(data);
				this.sharedPreferences.chat.active_room = data;
				this.receivedFilter.emit(this.sharedPreferences);
				this.chatEmiter.emit(data);

			}catch(error){}
		})
	} */
	
	private onChatLoadAllMessages(){
		this.socket.on(wSocket.ON_All_MSG, (emiter: string, data: any) => {
			try {
				console.log(data);
				this.chatEmiter.emit({action : 'loadAllMsg' , messages: data});
			}catch(error){}
		})
	}




	private onNewChatMsg(){
		this.socket.on(wSocket.ON_NEW_MSG, (emiter: string, data: any) => {
			try {
				if (this.sharedPreferences.chat.rooms.find(chat => chat.id == data.chatId) == undefined)
					this.socket.emit(wSocket.ON_JOIN_ROOM, data.chatId);
				this.chatEmiter.emit({action : 'newMsg' , messages: data});
			}catch(error){}
		})
	}
	
	private onJoinRoom(){
		this.socket.on(wSocket.ON_JOIN_ROOM, (emiter: string, data: any) => {
			try {
				this.sharedPreferences.chat.rooms.push(data);
			}catch(error){}
		})
	}
	emit(action: string, data?: any){
		data ? this.socket.emit(action, data) : this.socket.emit(action);
	}
	
/* 	emitWithData()
	emitUserUpdate(){
		this.socket.emit(wSocket.USER_UPDATE);
	}

	emitFriendInvitation(user: any){
		this.socket.emit(wSocket.FRIEND_INVITATION, user);
	} */


}
