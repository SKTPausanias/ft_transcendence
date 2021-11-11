import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild  } from '@angular/core';

import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { UserPublicInfoI } from 'src/app/shared/interface/iUserInfo';
import { DashboardService } from './dashboard.service';
import { debounceTime, map, distinctUntilChanged, filter} from "rxjs/operators";
import { fromEvent } from 'rxjs';
import { SharedPreferencesI } from 'src/app/shared/ft_interfaces';
import { ChannelI } from 'src/app/shared/interface/iChat';
import { ChatService } from '../chat/chat.service';
import { viewClassName } from '@angular/compiler';
import { NavChannel, TabDash } from 'src/app/shared/enums/eChannel';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
	@Input() dashboardPreference: SharedPreferencesI;
	@ViewChild('searchUsers', { static: true }) searchInput: ElementRef;
	@ViewChild('grpUsers') selectGroup: ElementRef<HTMLInputElement>; // object can be a basic object or specific type of HTML...
	@ViewChild('nChatElement') chatName: ElementRef<HTMLInputElement>;
	@ViewChild('target') checkBox: ElementRef<HTMLInputElement>;

	navOptionTab: number = TabDash.PEOPLE; //0=people; 1=channel; 2=scores; 3=notifications
	navOptionPane: number = NavChannel.ADDCHANNEL; //0:createChannel; 1=addMembers; 3=configChannel
	showUsers: boolean = false; //Values must be assigned in the constructor function...

	pass: string;
	passConfirm: boolean = false;

	channelInfo: ChannelI = <ChannelI>{};
	grpUsers: UserPublicInfoI[]; //userPublicInfo
	users: UserPublicInfoI[];
	session = this.sQuery.getSessionToken();
	channels: any[] = [];
	members: UserPublicInfoI[] = [];

	constructor(
	  private dashboardService: DashboardService,
	  private sQuery: SessionStorageQueryService,
	  private chatService: ChatService
	  ) {
		  this.grpUsers = [];
	  }
  
	ngOnInit() {
		this.initSearchboxListener();
		this.channelInfo.protected = false;
	}
	
	ngAfterViewInit() {
		this.grpUsers.push(this.dashboardPreference.userInfo);
		this.selectGroup.nativeElement.innerHTML += this.grpUsers[0].nickname + ": Owner\n";
		this.channelInfo.members = this.grpUsers;
	}
  
	async onSubmitFriends(): Promise<void> {
	  this.users = await this.dashboardService.searchUsers(this.session, this.searchInput.nativeElement.value);
	}
  
	initSearchboxListener(){
	  fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
		  map((event: any) => {
			return event.target.value;
		  })	//, filter(res => res.length > 2)
				, debounceTime(1000)
				, distinctUntilChanged()).subscribe((text: string) => {
				  if (text.length <= 0){
					  this.users = [];
					  this.showUsers = false;
				  }
				  else
					  this.onSearchBoxChange(text).subscribe((res: any)=> {
						  this.users = res;
						  this.showUsers = (this.users.length) ? true : false;
					  }, (err: any) => {
						  console.log('error', err);
					  });
		});
	}
	
	onSearchBoxChange(value: any)
	{	
		return (this.dashboardService.liveSearchUsers(this.session, value));
	}
	async addFriendShip(user: any): Promise<any>{
	  return (await this.dashboardService.addFriendShip(user, this.session))
	}
  
	async removeFriendShip(user: any): Promise<any>{
	  return (await this.dashboardService.removeFriendShip(user, this.session));
	}

	addToGroup(user: any){
		this.selectGroup.nativeElement.removeAttribute("hidden");
		this.selectGroup.nativeElement.parentElement?.removeAttribute("hidden");
		if (!this.grpUsers.find(search => (search.nickname == user.nickname))) {
			this.grpUsers.push(user);
			this.selectGroup.nativeElement.innerHTML += user.nickname + "\n";
		}
		
	}

	async createGroupChat(): Promise<void>{
		if (this.chatName.nativeElement.value != "" && this.grpUsers.length > 1) {
			var obj = {//this must be a channelI object
				chat_type: "private",
				password: "",
				protected: false,
				members: this.grpUsers,
				name_chat: this.chatName.nativeElement.value
			}
			var ret = (await this.dashboardService.createGroupChat(this.session, obj));
			ret.statusCode != 200 ? alert(ret.data.error) : null;
			console.log(ret);
		}
		else
			console.log("Create a chatGroup is not possible", ret);
		this.clean();
	}

	async onSubmitChannel():Promise<void>{
		/** creates a public Channel with no users attached to it because it is public
		 ** and will emmit to all users connected to it (think about this...)
		 ** Don't call to service if its fields aren't right filled*/
		if (this.passConfirm && this.channelInfo.password.length >= 6) {
			console.log(this.channelInfo);
			const ret = await this.dashboardService.addChannel(this.session, this.channelInfo);
			console.log("channel ret: ", ret);
		}
		else
			console.log("Not a valid channel: ", this.channelInfo);

	}

	selectTab(name: string):void {
		switch (name){
			case "friendTab":
				this.navOptionTab = TabDash.PEOPLE;
				break ;
			case "channelTab":
				this.navOptionTab = TabDash.CHANNEL;
				break;
		}
	}

	passCheckBox(e: any): void {
		this.channelInfo.protected = e.checked;
	}

	checkPass(value: string): boolean {
		if (this.pass === value)
		{
			console.log("pass matches: ", value);
			this.channelInfo.password = this.pass;
			this.passConfirm = true;
			return (true);
		}
		this.passConfirm = false;
		return (false);
	}

	selectType(type: any):void {
		this.channelInfo.chat_type = type.value;
	}
	
	async selectChannel(channel: any): Promise<void> {
		this.channelInfo = this.channels.find(element => element.name_chat == channel.value);
		if (this.navOptionPane == NavChannel.SETUP)
			this.checkBox.nativeElement.checked = this.channelInfo.protected;
		else if (this.navOptionPane == NavChannel.ADDMEMBER){
			console.log("Getting chat users...");
			this.members = (await this.chatService.getChatUsers(this.session, this.channelInfo)).data.users;
		}
		console.log("Channel name: ",this.channelInfo);
	}
	selectMembers(user: any): void {
		console.log("Select members active...");
	}

	async optionPaneNav(type: number):Promise<void> {
		if (type == NavChannel.ADDMEMBER || type == NavChannel.SETUP)
			this.channels = await this.chatService.getChatGroups(this.session);
		this.navOptionPane = type;
	}
	clean(){
		this.showUsers = false;
		this.users = []
		this.grpUsers = [];
		this.grpUsers.push(this.dashboardPreference.userInfo);
		this.selectGroup.nativeElement.innerHTML = "";
		this.searchInput.nativeElement.value = "";
		this.chatName.nativeElement.value = "";
		this.selectGroup.nativeElement.innerHTML += this.grpUsers[0].nickname + " Owner\n";
		this.selectGroup.nativeElement.setAttribute("hidden","hidden");
		this.selectGroup.nativeElement.parentElement?.setAttribute("hidden","hidden");
		this.initSearchboxListener();
	}
}
