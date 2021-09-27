import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';
import { UserI } from 'src/app/shared/interface/user';
import { HomeService } from '../../../home.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
	@ViewChild('factor_input') factorElement: ElementRef<HTMLInputElement>;
  user: UserI = this.sQuery.getUser();
  show : boolean = false;
  update_message : string = "";
  constructor(
    private sQuery: LocalStorageQueryService,
    private homeService: HomeService
  ) { }
  
  ngOnInit(): void {
  }

	async onSubmitSettings(value: any)
	{
		this.user.email = value.email;
		this.user.nickname = value.nickname;
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

	closeMsg(){
		this.show = false;
		this.update_message = "";
	}
}
