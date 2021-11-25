import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { eChat, Nav } from 'src/app/shared/ft_enums';
import { SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { DashboardService } from '../../dashboard/dashboard.service';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-channel-modal',
  templateUrl: './chat-modal.component.html',
  styleUrls: ['./chat-modal.component.css']
})
export class ChatModalComponent implements OnInit {
	@Input() public preferences: SharedPreferencesI;
	@Input() public type: string;
	@Output() passEntry: EventEmitter<any> = new EventEmitter();
	@ViewChild('searchUsers', { static: true }) searchInput: ElementRef;
	session = this.sQuery.getSessionToken();
	search: string;
	errorMsg:string;
	showAddFriendshipMsg: boolean;
	showAddButton: boolean;
	showForm: boolean;
	addPassword: boolean;
	channelName: string | undefined;
	channelType: string | undefined;
	password: string | undefined;
	repassword: string | undefined;
	searchResult: any[] = [];

	constructor(public modal: NgbActiveModal,
				private dashboardService: DashboardService,
	  			private sQuery: SessionStorageQueryService,
				private router: Router,
				private chatService: ChatService) {
					  this.initVariables(true);
				   }

	ngOnInit(): void {
		this.initSearchboxListener();
		if (this.type == 'friend')
			this.showAddButton = false;

		this.passEntry.emit("this is from modal: " + this.type);
	}
	openForm(){
		this.showForm = true;
	}
	save(){
		console.log("Channel name: ", this.channelName);
		console.log("Channel type: ", this.channelType);
		console.log("password: ", this.password);
		console.log("rePassword: ", this.repassword);
		if (this.password != this.repassword)
			this.errorMsg = "Passwords dosn't match";
		else
			this.modal.dismiss();	
	}
	cancel(dismiss: boolean){
		this.initVariables(dismiss);
		if (dismiss)
			this.modal.dismiss();
	}
	passCheckBox(){
		this.password = this.repassword = undefined;
		this.errorMsg = '';
		!this.addPassword ? (this.addPassword = false) : (this.addPassword = true);
	}
	selectType(target: any){
		this.channelType = target.value;
	}
	isChannel(){
		return (this.type == "channel" ? true : false);
	}
	initSearchboxListener(){
		fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
			map((event: any) => {
				return event.target.value;
			})	//, filter(res => res.length > 2)
					, debounceTime(1000)
					, distinctUntilChanged()).subscribe((text: string) => {
					if (text.length <= 0)
						this.searchResult = [];
					else
					{
						if (this.isChannel())
							this.searchResult = this.onSearchBoxChannelChange(text);
							//IMPORTANT WHEN CHANNEL SEARCH IS READY
							/* this.onSearchBoxChannelChange(text).subscribe((res: any)=> {
								this.searchResult = res;
							}, (err: any) => {
								console.log('error', err);
							}); */
						else
							this.onSearchBoxFriendChange(text).subscribe((res: any)=> {
								this.searchResult = res;
							}, (err: any) => {
								console.log('error', err);
							});
					}
						
		});
	}
	onSearchBoxFriendChange(value: any)
	{
		return (this.dashboardService.liveSearchUsers(this.session, value));
	}
	onSearchBoxChannelChange(value: any)
	{
		return ["test-channel-a","test-channel-b","test-channel-c", "test-channel-d", "test-channel-e", "test-channel-f", "test-channel-g", "test-channel-h", "test-channel-i" ];
	}
	async onSubmitFriends(): Promise<void> {
		if (this.type =='friend')
			this.searchResult = await this.dashboardService.searchUsers(this.session, this.searchInput.nativeElement.value);
		else
			this.searchResult = ["test-channel-a","test-channel-b","test-channel-c", "test-channel-d", "test-channel-e", "test-channel-f", "test-channel-g", "test-channel-h", "test-channel-i" ]
	}
	async addFriendShip(user: UserPublicInfoI): Promise<any>{
		const resp = await (this.dashboardService.addFriendShip(user, this.session));
		console.log("on add friendship: ", resp);
		if (resp)
			this.showAddFriendshipMsg = true;
		var counter = 3;
		let intervalId = setInterval(() => {
			counter--;
			console.log("counter: ", counter);
			if (counter-- == 0)
			{
				this.showAddFriendshipMsg = false;
				clearInterval(intervalId)
			}
		}, 1000)
		return (resp);
	}
	startChat(user: UserPublicInfoI){
		this.modal.dismiss();
		this.chatService.emit(eChat.ON_START, {members: [user]});
	}
	isNotFriend(user: UserPublicInfoI): boolean{
		return (this.preferences.friends.find(usr => usr.login == user.login) == undefined);
	}
	private initVariables(dismiss: boolean){
		this.search = '';
		this.errorMsg = '';
		this.showAddButton = true;
		this.showForm = false;
		this.addPassword = false;
		this.channelName = undefined;
		this.channelType = undefined;
		this.password = undefined;
		this.repassword = undefined;
		if (dismiss)
			this.searchResult = [];
	}
}
