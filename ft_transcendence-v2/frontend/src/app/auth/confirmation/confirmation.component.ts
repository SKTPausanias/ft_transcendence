import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Location } from '@angular/common';


@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {

	code: string;
	email: string;
	isLoaded: boolean;
	status: number = 200;
	errorMsg: string;
  	constructor(
		  private router: Router, 
		  private authService: AuthService,
		  private location: Location) {
		this.code = router.parseUrl(router.url).queryParams.code;
		this.email = router.parseUrl(router.url).queryParams.email;
		this.location.replaceState(this.location.path().split('?')[0], '');
		if (this.code !== undefined && this.email != undefined)
			this.confirm();
		else if (this.email === undefined)
			router.navigateByUrl('');
		else
			this.isLoaded = true;
   }

  ngOnInit(): void {
  }
  async confirm(){
	if (this.email !== undefined)
	{
		const resp = await this.authService.confirm({code : this.code, email: this.email});
		this.status = resp.statusCode;
		if (this.status == 200)
		{
			this.router.navigateByUrl('');
		}
		else
		{
			if (this.status == 403)
				this.errorMsg = "Confirmation link is not valid!";
			if (this.status == 410)
				this.errorMsg = "Confirmation link is expired!";
			this.isLoaded = true;

		}
	}
  }
  async resend(){
	  const resp = await this.authService.resendConfirmationEmail(this.email);
  }
  signUp(){
	  this.router.navigateByUrl('signUp');
  }

}
