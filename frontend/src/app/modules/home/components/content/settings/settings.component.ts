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
		//private file: File
	) { }
  
  ngOnInit(): void {
	  
	/* if (this.user.factor_enabled)
		this.factorElement.nativeElement.checked = true;
	else
	this.factorElement.nativeElement.checked = false;
  console.log("2 factor: ", this.user.factor_enabled); */
  }

	async onSubmitSettings(value: any)
	{
		
		this.user.email = value.email;
		this.user.nickname = value.nickname;
		
		var file = this.imageFile.nativeElement.files?.item(0) as File;
		if (file && file.size < 4000000){ //manage size and type showing a message inside settings
			
			console.log("sneding file to service: ");
			const res = await this.homeService.uploadImage(file);
			console.log("Response from upload: ", res);
			if (res !== false && res != "false")
			  this.user.avatar = "/assets/uploads/" + res;
		}
		//this.file = value.target.files[0];
		//if (result)
		// show popup [updated success X]
		//else
		// show popup [error updating X]
		this.sQuery.setUser(this.user);
		this.show = true;
		const result = await this.homeService.updateUser(this.user);
		if (result.ok == false)
			this.update_message = "Settings update error";
			//this.update_message = result.error.message;
		else
			this.update_message = "Successfully updated";
		this.sQuery.setUser(this.user);		
	}

	factorCheckbox(e: any) {
		if (e.target.checked)
			this.user.factor_enabled = true;
		else
			this.user.factor_enabled = false;
	}

	deleteAccount():void {
		console.log("Deleting account...");
		this.homeService.deleteUserAccount();
		this.sQuery.removeUser();
		this.router.navigateByUrl('/auth');
	}
	closeMsg(){
		this.show = false;
		this.update_message = "";
	}
}
