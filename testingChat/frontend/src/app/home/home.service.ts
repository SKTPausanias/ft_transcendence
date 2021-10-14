import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { io } from "socket.io-client";

@Injectable({
  providedIn: 'root'
})
export class HomeService {

	sck: any;
	constructor() {
	}
	handshake(token: string)
	{
		this.sck = io('ws://localhost:3000', {
		transportOptions: {
			polling: {
			extraHeaders: {
				'Authorization': 'Bearer ' + token,
			},
			},
		},
		});
		
		 this.sck.on('connect', () => {
			console.log('connected!');
			this.sck.emit('test', "Hola");
			//this.sck.emit('handshake', 'room1');
		  });
		  
		  this.sck.on('test', (data: any) => {
			console.log(data);
		  });
		//this.socket.ioSocket.handshake(new Headers({Authorization: "Bearer authorization_token_here"}));
	//	return (this.sck.emit('handshake', token));
	}
	/* sendChat(message: any){
		
	  this.socket.emit('chat', message);
	}
	receiveChat(){
	  return this.socket.fromEvent('chat');
	}
	getUsers(){
	  return this.socket.fromEvent('users');
	}
	getOnline(){
		return this.socket.fromEvent('online');
	}
	initChat(id: any){
		return (this.socket.emit('chatOneToOne', id));
	}
	oneToOne(){
		return (this.socket.fromEvent('chatOneToOne'));
	}
	 */
}
