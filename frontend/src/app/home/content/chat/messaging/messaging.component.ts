import { Component, Input, OnInit } from "@angular/core";

 interface ms{
	from: String,
	msg: String
}
@Component({
  selector: "app-messaging",
  templateUrl: "./messaging.component.html",
  styleUrls: ["./messaging.component.css"],
})
export class MessagingComponent implements OnInit {
	@Input() identity: String;
	msg: String = '';
	msgList: ms[] = [
		{from: 'me', msg: "Hello Juan"},
		{from: 'me', msg: "How are you?"},
		{from: 'Juan', msg: "Hi Dainis"},
		{from: 'Juan', msg: "I'm fine thank you"},
		{from: 'Juan', msg: "And how are you?"},
		{from: 'me', msg: "I'm verry well!I'm verry well!I'm verry well!I'm verry well!I'm verry well!I'm verry well!I'm verry well!"},
	];
	constructor() {}

	ngOnInit(): void {}
	send(){
		var trmMsg = this.msg.trim();
		if (trmMsg.length <= 0 )
			return ;
		console.log("sending msg: |", trmMsg, "|");
		this.msgList.push({from: 'me', msg: trmMsg});
		this.msg = '';
	}
}
