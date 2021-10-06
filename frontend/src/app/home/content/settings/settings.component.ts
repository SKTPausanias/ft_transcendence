import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageQueryService } from '../../../shared/service/session-storage-query.service';
import { UserInfoI } from 'src/app/shared/user/userI';
import { SettingsService } from './settings.service';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})

export class SettingsComponent implements OnInit {
	@ViewChild('factor_input') factorElement: ElementRef<HTMLInputElement>;
	@ViewChild('imageInput') imageFile: ElementRef<HTMLInputElement>;

	show : boolean = false;
	update_message : string = "";
	session = this.sQuery.getSessionToken();
	//user: UserInfoI = this.sQuery.getUser(); //add to authService setting user in sessionStorage so we can add to userInfo the data from the storage
	user: UserInfoI = <UserInfoI>{}; //provisional solution: bad :(
	
	constructor(
		private sQuery: SessionStorageQueryService,
		private settingService: SettingsService,
		private router: Router
		) {	}
		
  
  async ngOnInit(): Promise<void> {
	  console.log("Data storage: ", this.user);
	  const data = await this.settingService.getUserInfo(this.session);
		this.user = data.data;
	console.log("data from back userinfo: ", data.data);

  }

	async onSubmitSettings(value: any)
	{
		this.user.email = value.email;
		this.user.nickname = value.nickname;
		var res: boolean | string = false;
		var file = this.imageFile.nativeElement.files?.item(0) as File;
		if (file && file.size < 2000000){
			res = await this.settingService.uploadImage(file, this.user.login);
			if (res !== false)
			  this.user.avatar = "/assets/uploads/" + res;
		}
		
		this.show = true;
		const result = await this.settingService.updateUser(this.user);
		if ( res === false || result.ok === false)
			this.update_message = "Settings update error. Please check fields and image size[Max 2Mb]";
			//this.update_message = result.error.message;
		else {
			this.sQuery.setUser(this.user);
			this.update_message = "Successfully updated";
		}
	}

	factorCheckbox(e: any) {
		if (e.target.checked)
			this.user.factor_enabled = true;
		else
			this.user.factor_enabled = false;
	}

	deleteAccount():void {
		this.settingService.deleteUserAccount();
		this.sQuery.removeUser();
		this.router.navigateByUrl('/auth');
	}
	closeMsg(){
		this.show = false;
		this.update_message = "";
	}
}
