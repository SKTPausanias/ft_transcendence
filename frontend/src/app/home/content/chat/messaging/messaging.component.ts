import { Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren } from "@angular/core";

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
	@ViewChild('scrollframe', {static: false}) scrollFrame: ElementRef;
	@ViewChildren('scroolMsg') itemElements: QueryList<any>;
	private scrollContainer: any;

	msg: String = '';
	msgList: ms[] = [
		{from: 'me', msg: "Hello Juan"},
		{from: 'me', msg: "How are you?"},
		{from: 'Juan', msg: "Hi Dainis"},
		{from: 'Juan', msg: "I'm fine thank you"},
		{from: 'Juan', msg: "And how are you?"},
		{from: 'Juan', msg: "And how are you?"},
		{from: 'Juan', msg: "And how are you?"},
		{from: 'Juan', msg: "And how are you?"},
		{from: 'Juan', msg: "And how are you?"},
		{from: 'Juan', msg: "And how are you?"},
		{from: 'Juan', msg: "And how are you?"},
		{from: 'me', msg: "I'm verry well!I'm verry well!I'm verry well!I'm verry well!I'm verry well!I'm verry well!I'm verry well!"},
	];
	constructor() {}

	ngOnInit(): void {
		var element = document.getElementById("oMsg");
		if(element != null && element != undefined)
			element.scrollTop = element.scrollHeight;
	}
	ngAfterViewInit() {
		this.scrollContainer = this.scrollFrame.nativeElement;
		this.itemElements.changes.subscribe(_ => this.onItemElementsChanged());
		this.scrollToBottom();
	}
	send(){
		var trmMsg = this.msg.trim();
		if (trmMsg.length <= 0 )
			return ;
		console.log("sending msg: |", trmMsg, "|");
		this.msgList.push({from: 'me', msg: trmMsg});
		this.msg = '';
	}
	private onItemElementsChanged(): void {
		console.log("detected");
		this.scrollToBottom();
	  }
	private scrollToBottom(): void {
		this.scrollContainer.scroll({
		  top: this.scrollContainer.scrollHeight,
		  left: 0,
		  behavior: 'smooth'
		});
	  }
}
