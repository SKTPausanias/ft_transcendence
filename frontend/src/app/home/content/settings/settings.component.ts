import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { UserInfoI } from 'src/app/shared/ft_interfaces';
import { SettingsService } from './settings.service';
import { RightNavComponent } from '../../right-nav/right-nav.component';


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
	user: UserInfoI = this.sQuery.getUser();
	
	constructor(
		private sQuery: SessionStorageQueryService,
		private settingService: SettingsService,
		private router: Router
		) {	}
		
  
   ngOnInit(): void {	 
	console.log("onInit settings");
  }

	async onSubmitSettings(value: any)
	{
		this.user.email = value.email;
		this.user.nickname = value.nickname;
		const result = await this.settingService.updateUser(this.user, this.session);
		console.log(result);
		if (result.statusCode == 200)
		{
			this.sQuery.setUser(result.data);
			this.user = result.data;
		}
		else
			console.log("error: ", result);
		/* var res: boolean | string = false;
		var file = this.imageFile.nativeElement.files?.item(0) as File;
		if (file && file.size < 2000000){
			res = await this.settingService.uploadImage(file, this.user.login);
			if (res !== false)
			  this.user.avatar = "/assets/uploads/" + res;
		}
		
		this.show = true;
		if ( res === false || result.ok === false)
			this.update_message = "Settings update error. Please check fields and image size[Max 2Mb]";
			//this.update_message = result.error.message;
		else {
			this.sQuery.setUser(this.user);
			this.update_message = "Successfully updated";
		} */
	}
	async onUploadAvatar(value: any){
		var file = this.imageFile.nativeElement.files?.item(0) as File;
		var res: boolean | string = false;
		try {
			if (file && file.size < 2000000){
			
			res = await this.settingService.uploadImage(file, this.user.login, this.session);
			console.log(res);
			if (res !== false)
			this.user.avatar = "/assets/uploads/" + res;
			}
		} catch (error) {
			
		}
	}

	factorCheckbox(e: any) {
		if (e.target.checked)
			this.user.factor_enabled = true;
		else
			this.user.factor_enabled = false;
	}

	async deleteAccount(): Promise<void> {
		const resp = await this.settingService.deleteUserAccount(this.session);
		this.sQuery.removeAll();
		this.router.navigateByUrl('logIn');
	}
	closeMsg(){
		this.show = false;
		this.update_message = "";
	}
}
