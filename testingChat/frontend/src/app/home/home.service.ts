import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

	
	constructor(private socket: Socket) {
	}
	sendChat(message: any){
		
	  this.socket.emit('chat', message);
	}
	receiveChat(){
	  return this.socket.fromEvent('chat');
	}
	getUsers(){
	  return this.socket.fromEvent('users');
	}
	
}
