import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable, EventEmitter } from "@angular/core";
import { Socket } from "socket.io-client";
import { eChat, Nav } from "src/app/shared/ft_enums";
import { ChatI, ChatPasswordUpdateI, ChatRoomI, RoomKeyI, SessionI, SharedPreferencesI } from "src/app/shared/ft_interfaces";
import { UserPublicInfoI } from "src/app/shared/interface/iUserInfo";
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
		this.onUnreadMsg();
	}

	private onStartChat(){
		this.socket.on(eChat.ON_START, (emiter: string, data: any) => {
			try {
				if (this.sharedPreferences.chat.rooms.find(chat => chat.id == data.id) == undefined)
					this.sharedPreferences.chat.rooms.push(data);
				this.sharedPreferences.chat.active_room = data;
				this.chatPreferenceEmiter.emit({chat : this.sharedPreferences.chat});
				this.chatEmiter.emit({room : data});
			}catch(error){}
		})
	}
	
	private onChatLoadAllMessages(){
		this.socket.on(eChat.ON_All_MSG, (emiter: string, data: any) => {
			try {
				this.chatEmiter.emit({messages: data});
			}catch(error){}
		})
	}

	private onNewChatMsg(){
		this.socket.on(eChat.ON_NEW_MSG, (emiter: string, data: any) => {
			const activeRoom = this.sharedPreferences.chat.active_room;
			const path = this.sharedPreferences.path;
			try {
				if (this.sharedPreferences.chat.rooms.find(chat => chat.id == data.chatId) == undefined)
					this.socket.emit(eChat.ON_UPDATE_ROOM, {room : data});
				if (activeRoom != undefined && activeRoom.id == data.chatId && path != undefined && path == Nav.CHAT )
				{
					this.chatEmiter.emit({newMessage: data});
					this.socket.emit(eChat.ON_READ_MSG, data);
				}
				else
					this.socket.emit(eChat.ON_GET_UNREAD_MSG, data.chatId);


			}catch(error){}
		})
	}
	private onUnreadMsg(){
		this.socket.on(eChat.ON_GET_UNREAD_MSG, (emiter: string, data: number) => {
		this.chatPreferenceEmiter.emit({unreaded: data});
		});
	}
	
	private onJoinRoom(){
		this.socket.on(eChat.ON_JOIN_ROOM, (data: any) => {
			try {
				this.sharedPreferences.chat.rooms.push(data);
				this.chatPreferenceEmiter.emit({rooms : this.sharedPreferences.chat.rooms});
				this.chatEmiter.emit();
			}catch(error){}
		})
	}
	
	private onLeaveRoom(){
		this.socket.on(eChat.ON_LEAVE_ROOM, (emiter: string, data: any) => {
			try {
				this.sharedPreferences.chat.rooms = this.sharedPreferences.chat.rooms.filter(room => room.id != data.id);
				if (this.sharedPreferences.chat.active_room != undefined && this.sharedPreferences.chat.active_room.id == data.id)
					this.sharedPreferences.chat.active_room = undefined;
				this.chatPreferenceEmiter.emit({ chat : this.sharedPreferences.chat});
				this.chatEmiter.emit({onDestroy : data});
			}catch(error){
			}
		})
	}
	
	private onLoadActiveRooms(){
		this.socket.on(eChat.ON_LOAD_ACTIVE_ROOMS, (emiter: string, data: any) => {
			try {
				this.sharedPreferences.chat.rooms = data;
				this.chatPreferenceEmiter.emit({ rooms : this.sharedPreferences.chat.rooms});
				this.chatEmiter.emit();
			}catch(error){}
		})
	}
	private onUpdateRoom(){
		this.socket.on(eChat.ON_UPDATE_ROOM, (emiter: string, data: ChatRoomI) => {
			var chat = this.sharedPreferences.chat;
			try {
				const index = this.sharedPreferences.chat.rooms.findIndex(item => item.id == data.id);
				if (index < 0)
					this.sharedPreferences.chat.rooms.push(data);
				else
					this.sharedPreferences.chat.rooms[index] = data;
				if (chat.active_room != undefined && chat.active_room.id == data.id)
				{
					this.sharedPreferences.chat.active_room = chat.rooms.find(item => item.id == data.id)
					this.chatPreferenceEmiter.emit({chat : this.sharedPreferences.chat});
				}
				else
					this.chatPreferenceEmiter.emit({rooms : this.sharedPreferences.chat.rooms});
				this.chatEmiter.emit();
				if (!this.sharedPreferences.chat.active_room.hasRoomKey)
					this.chatEmiter.emit({close : data});
			}catch(error){}
		})
	}

	async addChannel(session: SessionI, channelInfo: ChatI): Promise<any> {
		const url = '/api/users/chat/addChannel';
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
	async unlockRoom(session: SessionI, key: RoomKeyI): Promise<any> {
		const url = '/api/users/chat/unlockRoom';
		try{
		  const ret = (await this.http.post<any>(url, key, { headers: new HttpHeaders({
			  Authorization: 'Bearer ' + session.token
			})
		  }).toPromise())
		return (ret);
		} catch(e){
		  return (e);
		}
	}
	async updatePassChannel(session: SessionI, channelInfo: ChatPasswordUpdateI): Promise<any> {
		const url = '/api/users/chat/updatePassChannel';
		try {
			const ret = (await this.http.post<any>(url, channelInfo, { headers: new HttpHeaders({
					Authorization: 'Bearer ' + session.token})}).toPromise())
			return (ret);
		} catch (e) {
			return (e);
		}
	}

	liveSearchRooms(session: SessionI, val: string): any{
		
	const url = '/api/users/chat/searchRooms';
	var data: HttpParams = new HttpParams().set("value", val);
	try{
		return (this.http.get<any>(url, { headers: new HttpHeaders({
			Authorization: 'Bearer ' + session.token}),
			params: data
			}))
	}catch(e){
		return ([]);
	}
	}
	async searchRooms(session: SessionI, val: string): Promise<any>{
		
	const url = '/api/users/chat/searchRooms';
	var data: HttpParams = new HttpParams().set("value", val);
	try{
		const ret = await (this.http.get<any>(url, { headers: new HttpHeaders({
			Authorization: 'Bearer ' + session.token}),
			params: data
			}).toPromise());
			return (ret.data);
	}catch(e){
		return ([]);
	}
	}
	emit(action: string, data?: any){
		data ? this.socket.emit(action, data) : this.socket.emit(action);
	}

	async joinRoom(session: SessionI, room: any): Promise<any>{
		const url = '/api/users/chat/joinRoom';
		try{
			const ret = await (this.http.post<any>(url, room, { headers: new HttpHeaders({
				Authorization: 'Bearer ' + session.token})},).toPromise());
			return (ret);
		}catch(e){
			return (e);
		}
	}
	async getUserInfo(user: UserPublicInfoI, session: SessionI)
	{
		const url = '/api/users/publicInfo ';
		try{
			const response = await this.http.post<any>(url, {token : session.token, user : user}).toPromise();
			return (response);
		}catch(e){
			return ([]);
		}
	}
	async getUserPosition(user: UserPublicInfoI, session: SessionI)
	{
		const url = '/api/users/userPosition ';
		try{
			const response = await this.http.post<any>(url, {token : session.token, user : user}).toPromise();
			return (response);
		}catch(e){
			return ([]);
		}
	}
}