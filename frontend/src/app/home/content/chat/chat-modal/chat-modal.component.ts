import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { eChat, eChatType, Nav } from 'src/app/shared/ft_enums';
import { SharedPreferencesI, ChatI, ChatRoomI, RoomKeyI } from 'src/app/shared/ft_interfaces';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { DashboardService } from '../../dashboard/dashboard.service';
import { ChatService } from '../chat.service';
import { StatusMessageI } from './statusMsgI';

@Component({
  selector: 'app-channel-modal',
  templateUrl: './chat-modal.component.html',
  styleUrls: ['./chat-modal.component.css']
})
export class ChatModalComponent implements OnInit {
	@Input() public preferences: SharedPreferencesI;
	@Input() public type: string;
	@Input() public room: ChatRoomI;
	@Output() passEntry: EventEmitter<any> = new EventEmitter();
	@ViewChild('searchUsers', { static: true }) searchInput: ElementRef;
	session = this.sQuery.getSessionToken();
	search: string;
	statusMsg: StatusMessageI = <StatusMessageI>{};
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
		if (this.room != undefined && this.room.protected)
		this.statusMsg = <StatusMessageI>{
			isError: true,
			message : "DONT FORGET TO HASH PASWORD IN SERVER SIDE AND REMOVE THIS MESSAGE FROM ngOnInit()"
		};
	}
	openForm(){
		this.showForm = true;
	}
	
	async save(): Promise<void> {
		if (!this.checkFormData())
			return ;
		var channelInfo: ChatI = <ChatI> {
			name: this.channelName,
			type: this.getChannelType(),
			password: this.password,
			protected: this.addPassword, //provisional
		};
		channelInfo.members = [this.preferences.userInfo];
		
		const resp = await this.chatService.addChannel(this.session, channelInfo);
		if (resp.statusCode == 200)
		{
			this.passEntry.emit({action: "onUpdateChannel"});
			this.passEntry.emit({action: "joinRoom", room : resp.data});
			this.modal.dismiss();
			return ;
		}
		this.startStatusMsgTimer(<StatusMessageI>{
			isError: true,
			message : resp.data.error
		});
	}
	cancel(dismiss: boolean){
		this.initVariables(dismiss);
		if (dismiss)
			this.modal.dismiss();
	}
	passCheckBox(){
		this.password = this.repassword = undefined;
		this.statusMsg = <StatusMessageI>{};
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
								this.filterSearchResults();
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
		//return (this.chatService.live)
		return ["test-channel-a","test-channel-b","test-channel-c", "test-channel-d", "test-channel-e", "test-channel-f", "test-channel-g", "test-channel-h", "test-channel-i" ];
	}
	async onSubmitFriends(): Promise<void> {
		if (!this.isChannel())
		{
			if (this.searchInput.nativeElement.value.length > 0)
				this.searchResult = await this.dashboardService.searchUsers(this.session, this.searchInput.nativeElement.value);
			this.filterSearchResults();
		}
		else
			this.searchResult = ["test-channel-a","test-channel-b","test-channel-c", "test-channel-d", "test-channel-e", "test-channel-f", "test-channel-g", "test-channel-h", "test-channel-i" ]
	}
	async onJoinProtectedRoom(){
		const resp = await this.chatService.unlockRoom(this.session, <RoomKeyI>{
			id: this.room.id,
			password: this.password
		});
		if (resp.statusCode == 200)
		{
			this.passEntry.emit({action : "joinRoom", room : resp.data});
			this.modal.dismiss();
			return ;
		}
		this.startStatusMsgTimer(<StatusMessageI>{
			isError: true,
			message : "Wrong room password"
		});
	}
	filterSearchResults(){
		if (this.type == 'member')
			this.searchResult = this.searchResult.filter(el => {
			      return !this.preferences.chat.active_room.members.find((element : UserPublicInfoI) => {
			      return element.login === el.login;
			      });
			   });
	}
	async addFriendShip(user: UserPublicInfoI): Promise<any>{
		const resp = await (this.dashboardService.addFriendShip(user, this.session));
		if (resp)
			this.startStatusMsgTimer(<StatusMessageI>{
				isError: false,
				message : "Friend invitation has been send"
			});
		return (resp);
	}
	addMemberToChat(user: UserPublicInfoI){
		this.chatService.emit(eChat.ON_ADD_MEMBER_TO_CHAT, {room : this.preferences.chat.active_room, member: user});
		this.startStatusMsgTimer(<StatusMessageI>{
			isError: false,
			message : "Member has been added to this room"
		});
		
	}
	startChat(user: UserPublicInfoI){
		this.modal.dismiss();
		var chatInfo: ChatI = <ChatI>{};
		chatInfo.type = eChatType.DIRECT;
		this.chatService.emit(eChat.ON_START, {members: [user], chatInfo});
	}
	isNotFriend(user: UserPublicInfoI): boolean{
		return (this.preferences.friends.find(usr => usr.login == user.login) == undefined);
	}
	getChannelType(){
		if (this.channelType == eChatType.PRIVATE || this.channelType == eChatType.PUBLIC)
			return (this.channelType);
		return (eChatType.DIRECT);
	}

	checkFormData(){
		var error = true;
		var msg = "";
		if (this.channelName == undefined || !this.channelName.length)
			msg = "Bad channel name"
		else if (this.channelType == undefined || !this.channelType.length)
			msg = "Please select channel type"
		else if (this.password != this.repassword)
			msg = "Passwords dosn't match"
		else if (this.addPassword && (this.password == undefined || !this.password.length))
			msg = "Channel marked as protected. Please select password"
		else
			error = false
		if (error)
			this.startStatusMsgTimer(<StatusMessageI>{
				isError: error,
				message : msg
			});
		return (!error);
	}
	startStatusMsgTimer(msgStatus: StatusMessageI)
	{
		this.statusMsg = msgStatus;
		var counter = 3;
		let intervalId = setInterval(() => {
			counter--;
			if (counter-- == 0)
			{
				this.statusMsg = <StatusMessageI>{};
				clearInterval(intervalId)
			}
		}, 1000)
	}

	private initVariables(dismiss: boolean){
		this.statusMsg = <StatusMessageI>{};
		this.search = '';
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
