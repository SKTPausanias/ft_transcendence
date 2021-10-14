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
	date: any;
	constructor(private chatService: HomeService){
	}
	ngOnInit(){
	  this.chatService.receiveChat().subscribe((message: any) => {
		  console.log("[reciveChat] SERVER: ", message);
		  var date = new Date(Date.now()).toISOString();
		 this.messages.push({message, date});
	  });
	  this.chatService.getUsers().subscribe((users: any) => {
		//console.log("[getusers] SERVER: ", users);
		this.users = users;
	  });
	}
 	addChat(){
	  //this.messages.push(this.message);
	  console.log("Messages: ", this.messages);
	  
	  this.chatService.sendChat(this.message);
	  this.message = "";
	} 
	/*send(){
		this.chatService.sendChat(this.msg);
	}*/

}
