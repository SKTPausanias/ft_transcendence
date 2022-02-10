import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { AuthService } from '../auth.service';
import { Location } from '@angular/common';


@Component({
  selector: 'app-two-factor',
  templateUrl: './two-factor.component.html',
  styleUrls: ['./two-factor.component.css']
})
export class TwoFactorComponent implements OnInit {

	email: string;
	code: number;
	isLoaded = true;
  constructor(private sQuery: SessionStorageQueryService,
				private authService: AuthService,
				private router: Router,
				private location: Location) {
		this.email = router.parseUrl(router.url).queryParams.email;
		this.location.replaceState(this.location.path().split('?')[0], '');
		if (this.email === undefined)
			router.navigateByUrl('');
		}

  ngOnInit(): void {
	  this.resend();
  }
  async resend(){
	  try {
		  const resp = await this.authService.generate(this.email);
		  //this.code = resp;
	  } catch (error) {
	  }
  }
  async validate(val : any){
	const resp = await this.authService.validate(val.code, this.email);
	if (resp.statusCode != 200)
		console.log("bad code: ", resp)
	else
	{
		this.sQuery.setSessionToken(resp.data);
		this.router.navigateByUrl('');
	}
  }

}
