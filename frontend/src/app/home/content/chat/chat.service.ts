import { Injectable, EventEmitter } from "@angular/core";
import { Socket } from "socket.io-client";
import { wSocket } from "src/app/shared/ft_enums";
import { SharedPreferencesI } from "src/app/shared/ft_interfaces";
import { SocketService } from "../../socket.service";

@Injectable({providedIn: "root"})
export class ChatService {
	chatFragmentEmmiter: EventEmitter<any>;
/* 	chatEmiter: EventEmitter<any>;
	prefEmiter: EventEmitter<any>; */

	private socket: Socket;
	sharedPreferences: SharedPreferencesI = <SharedPreferencesI>{};
	constructor() {
		this.chatFragmentEmmiter = new EventEmitter<any>();/* 
		this.chatEmiter = new EventEmitter<any>();
		this.prefEmiter = new EventEmitter<any>(); */
	}
/* 	init(socket: Socket, sharedPreference: SharedPreferencesI) {
		this.socket = socket;
		this.sharedPreferences = sharedPreference;
		this.onStartChat();
		this.onChatLoadAllMessages();
		this.onNewChatMsg();
		this.onJoinRoom();
	}
	private onStartChat() {
		this.socket.on(wSocket.ON_START, (emiter: string, data: any) => {
			try {
				if (!this.roomExists(data.id))
					this.sharedPreferences.chat.rooms.push(data);
				this.sharedPreferences.chat.active_room = data;
				this.prefEmiter.emit(this.sharedPreferences.chat);
				//this.socketService.emitSharedPreferences(this.sharedPreferences);
				this.chatEmiter.emit({ action: "open", room: data });
			} catch (error) {}
		});
	}
	private onChatLoadAllMessages() {
		this.socket.on(wSocket.ON_All_MSG, (emiter: string, data: any) => {
			try {
				this.chatEmiter.emit({ action: "loadAllMsg", messages: data });
			} catch (error) {}
		});
	}
	private onNewChatMsg() {
		this.socket.on(wSocket.ON_NEW_MSG, (emiter: string, data: any) => {
		try {
				if (this.roomExists(data.chatId))
					this.socket.emit(wSocket.ON_JOIN_ROOM, data.chatId);
				this.chatEmiter.emit({ action: "newMsg", messages: data });
			} catch (error) {}
		});
	}

	private onJoinRoom() {
		this.socket.on(wSocket.ON_JOIN_ROOM, (emiter: string, data: any) => {
		try {
			this.sharedPreferences.chat.rooms.push(data);
			this.prefEmiter.emit(this.sharedPreferences.chat);
		} catch (error) {}
		});
	}
	private roomExists(id: number)
	{
		return (this.sharedPreferences.chat.rooms.find((chat) => chat.id == id) != undefined)
	} */
}
