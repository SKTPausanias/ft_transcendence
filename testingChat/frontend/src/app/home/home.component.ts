import { NullTemplateVisitor } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { HomeService } from './home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	public users: number = 0;
	obj: any = { message: String, date: String };
	messages: any[] = [];
	message: string = '';
	friends: any[] = [];
	date: any;
	pwd: number = 0;
	constructor(private chatService: HomeService){
	}
	ngOnInit(){
		this.chatService.handshake("ABBCC");
		/* .subscribe((resp: any) =>{
			console.log(resp);
		}); */




	  /* this.chatService.receiveChat().subscribe((message: any) => {
		  console.log("[reciveChat] SERVER: ", message);
		  var date = new Date(Date.now()).toISOString();
		 this.messages.push({message, date});
	  });
	  this.chatService.getUsers().subscribe((users: any) => {
		//console.log("[getusers] SERVER: ", users);
		this.users = users;
	  });
	  this.chatService.getOnline().subscribe((friends: any) => {
		this.friends = friends;
	  });
	  this.chatService.oneToOne().subscribe((resp: any)=> {
		  console.log(resp);
	  }) */
	}
 	addChat(){
	  //this.messages.push(this.message);
	  console.log("Messages: ", this.messages);
	  
	 // this.chatService.sendChat(this.message);
	  this.message = "";
	} 
	/*send(){
		this.chatService.sendChat(this.msg);
	}*/
	initChat(id: any){
		console.log(this.pwd);
	//	this.chatService.initChat({id: id, pwd: this.pwd});
	}
}
