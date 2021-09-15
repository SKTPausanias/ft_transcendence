import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';
import { UserI } from 'src/app/shared/interface/user';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-auth2factor',
  templateUrl: './auth2factor.component.html',
  styleUrls: ['./auth2factor.component.css']
})
export class Auth2factorComponent implements OnInit {

  user: UserI = this.sQuery.getUser();
  userEmail: string = "";
	counter = 10;
	counterMsg = "";
  constructor(private sQuery: LocalStorageQueryService,
              private authService: AuthService,
              private route: Router) { }

  ngOnInit(): void {
    this.partialHide();
    this.authService.sendCode2Factor(this.user);
	this.timeCounter();
  }

  partialHide(): void {
    var i;

    this.userEmail += this.user.email[0];
    for (i = 1; this.user.email[i] != '@'; i++)
    {
      this.userEmail += '*';
    }
    this.userEmail += this.user.email.substring(i);
  }
  async getAuthenticate(value: any): Promise<void>
  {
    this.user.code2factor = value.validation_code;
	/*{
			userId:
			code;
		}
		*/
    const ret = await this.authService.validate2Factor(this.user);
	console.log("get authenticate code: ", this.user);
    if (ret)
      this.route.navigateByUrl('/');
	else
		console.log("WRONG CODE! TRY AGAIN");
  }

  reSendCode(): void {
    this.authService.reSendCode2Factor(this.user);
  }
  timeCounter(){
	/* 	let intervalId = setInterval(() => {
		this.counter = this.counter - 1;
		this.counterMsg = String(this.counter);
		console.log(this.counter)
		if(this.counter === 0){

			clearInterval(intervalId);
			this.counterMsg = "EXPIRED";
			console.log("Time expired! You must click on resend code!");

			//if (!this.user.online)
			//	this.sQuery.removeUser();

			//this.route.navigateByUrl('/');
		}
	}, 1000) */
	console.log("thats it");
	
  }
}
