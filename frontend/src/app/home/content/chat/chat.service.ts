import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, EventEmitter } from "@angular/core";
import { Socket } from "socket.io-client";
import { eChat } from "src/app/shared/ft_enums";
import { ChatI, SessionI, SharedPreferencesI } from "src/app/shared/ft_interfaces";
import { SocketService } from "../../socket.service";

@Injectable({providedIn: "root"})
export class ChatService {
	chatFragmentEmmiter: EventEmitter<any>;
	chatEmiter: EventEmitter<any>;
	chatPreferenceEmiter: EventEmitter<any>;

	private socket: Socket;
	sharedPreferences: SharedPreferencesI = <SharedPreferencesI>{};
	constructor(private http: HttpClient) {
		this.chatFragmentEmmiter = new EventEmitter<any>();
		this.chatEmiter = new EventEmitter<any>();
		this.chatPreferenceEmiter = new EventEmitter<any>();
	}

	initGateway(socket: Socket, sharedPreference: SharedPreferencesI) {
		this.socket = socket;
		this.sharedPreferences = sharedPreference;
		this.onStartChat();
		this.onJoinRoom();
		this.onLeaveRoom();
		this.onLoadActiveRooms();
		this.onChatLoadAllMessages();
		this.onNewChatMsg();
		this.onUpdateRoom();


		this.onTest();
	}

	private onStartChat(){
		this.socket.on(eChat.ON_START, (emiter: string, data: any) => {
			try {
				console.log("onStartChat: ", data);
				if (this.sharedPreferences.chat.rooms.find(chat => chat.id == data.id) == undefined)
					this.sharedPreferences.chat.rooms.push(data);
				this.sharedPreferences.chat.active_room = data;
				this.chatPreferenceEmiter.emit(this.sharedPreferences.chat);
				this.chatEmiter.emit({action: 'open', room : data});
			}catch(error){}
		})
	}
	
	private onChatLoadAllMessages(){
		this.socket.on(eChat.ON_All_MSG, (emiter: string, data: any) => {
			try {
				this.chatEmiter.emit({action : 'loadAllMsg' , messages: data});
			}catch(error){}
		})
	}

	private onNewChatMsg(){
		this.socket.on(eChat.ON_NEW_MSG, (emiter: string, data: any) => {
			console.log("onNewChatMsg: ", data);
			try {
				console.log("on new msg");
				if (this.sharedPreferences.chat.rooms.find(chat => chat.id == data.chatId) == undefined)
					this.socket.emit(eChat.ON_JOIN_ROOM, data.chatId);
				this.chatEmiter.emit({action : 'newMsg' , messages: data});
			}catch(error){}
		})
	}
	
	private onJoinRoom(){
		this.socket.on(eChat.ON_JOIN_ROOM, (data: any) => {
			try {
				this.sharedPreferences.chat.rooms.push(data);
				this.chatPreferenceEmiter.emit(this.sharedPreferences.chat);
				this.chatEmiter.emit();
			}catch(error){}
		})
	}
	
	private onLeaveRoom(){
		this.socket.on(eChat.ON_LEAVE_ROOM, (emiter: string, data: any) => {
			try {
				console.log("on leave room: ", data);
				//if (this.sharedPreferences.chat.rooms.find(room => room.id == data.id) == undefined)
				this.sharedPreferences.chat.rooms = this.sharedPreferences.chat.rooms.filter(room => room.id != data.id);
				if (this.sharedPreferences.chat.active_room.id == data.id)
					this.sharedPreferences.chat.active_room = undefined;
				this.chatPreferenceEmiter.emit(this.sharedPreferences.chat);
				this.chatEmiter.emit({action : 'onDestroy'});
			}catch(error){}
		})
	}
	
	private onLoadActiveRooms(){
		this.socket.on(eChat.ON_LOAD_ACTIVE_ROOMS, (emiter: string, data: any) => {
			try {
				this.sharedPreferences.chat.rooms = data;
				this.chatPreferenceEmiter.emit(this.sharedPreferences.chat);
				this.chatEmiter.emit();

			}catch(error){}
		})
	}
	private onUpdateRoom(){
		this.socket.on(eChat.ON_UPDATE_ROOM, (emiter: string, data: any) => {
			try {
				console.log("OnUpdateRoom: ", data);
				const index = this.sharedPreferences.chat.rooms.findIndex(item => item.id == data.id);
				if (index < 0)
					this.sharedPreferences.chat.rooms.push(data);
				else
					this.sharedPreferences.chat.rooms[index] = data;
				this.chatPreferenceEmiter.emit(this.sharedPreferences.chat);
				this.chatEmiter.emit();
			}catch(error){}
		})
	}

	async addChannel(session: SessionI, channelInfo: ChatI): Promise<any> {
		const url = '/api/users/chat/addChannel';
		console.log("data from body: ", channelInfo);
		try{
		  const ret = (await this.http.post<any>(url, channelInfo, { headers: new HttpHeaders({
			  Authorization: 'Bearer ' + session.token
			})
		  }).toPromise())
		return (ret);
		} catch(e){
		  return (e);
		}
	  }


	emit(action: string, data?: any){
		data ? this.socket.emit(action, data) : this.socket.emit(action);
	}



	private onTest(){
		this.socket.on('test', (data: any) => {
			console.log("onTest: ", data);
		})
	}
}