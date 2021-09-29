import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';
import { UserI } from 'src/app/shared/interface/user';
import { HomeService } from '../../../home.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
	@ViewChild('factor_input') factorElement: ElementRef<HTMLInputElement>;
	@ViewChild('imageInput') imageFile: ElementRef<HTMLInputElement>;
	user: UserI = this.sQuery.getUser();
	show : boolean = false;
	update_message : string = "";
	constructor(
		private sQuery: LocalStorageQueryService,
		private homeService: HomeService,
		private router: Router,
	) { }
  
  ngOnInit(): void {
  }

	async onSubmitSettings(value: any)
	{
		
		this.user.email = value.email;
		this.user.nickname = value.nickname;
		var res: boolean | string = false;
		var file = this.imageFile.nativeElement.files?.item(0) as File;
		if (file && file.size < 2000000){
			res = await this.homeService.uploadImage(file, this.user.login);
			if (res !== false)
			  this.user.avatar = "/assets/uploads/" + res;
		}
		
		this.show = true;
		const result = await this.homeService.updateUser(this.user);
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
		this.homeService.deleteUserAccount();
		this.sQuery.removeUser();
		this.router.navigateByUrl('/auth');
	}
	closeMsg(){
		this.show = false;
		this.update_message = "";
	}
}
