import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	public users: number = 0;
	public message: any;
	public messages: string[] = [];
	msg: string = '';
	constructor(private chatService: HomeService){
	}
	ngOnInit(){
	  this.chatService.receiveChat().subscribe((message: any) => {
		  console.log("[reciveChat] SERVER: ", message);
		this.messages.push(message);
	  });
	  this.chatService.getUsers().subscribe((users: any) => {
		console.log("[getusers] SERVER: ", users);

		this.users = users;
	  });
	}
 	addChat(){
	  this.messages.push("idUsuario: " + this.message);
	  this.chatService.sendChat(this.message);
	  //this.message = '';
	} 
	send(){
		this.chatService.sendChat(this.msg);
	}

}
