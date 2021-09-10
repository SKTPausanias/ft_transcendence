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
    console.log(this.user);
		this.user.email = value.email;
		this.user = await this.homeService.updateUser(this.user);
		this.sQuery.setUser(this.user);
    console.log(this.sQuery.getUser());	
	}

	factorCheckbox(e: any) {
		if (e.target.checked)
			this.user.factor_enabled = true;
		else
			this.user.factor_enabled = false;
	}
}
