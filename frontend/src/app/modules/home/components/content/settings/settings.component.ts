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
  constructor(
    private sQuery: LocalStorageQueryService,
    private homeService: HomeService
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
		const result = await this.homeService.updateUser(this.user);
		//if (result)
		// show popup [updated success X]
		//else
		// show popup [error updating X]
		this.sQuery.setUser(this.user);		
	}

	factorCheckbox(e: any) {
		if (e.target.checked)
			this.user.factor_enabled = true;
		else
			this.user.factor_enabled = false;
	}
}
