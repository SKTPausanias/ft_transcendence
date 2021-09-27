import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';
import { UserI } from 'src/app/shared/interface/user';
import { AuthService } from '../../auth.service';
import { CodeI } from '../../../../shared/interface/c2f';

/*@Component({
  selector: 'resend-box',
  template: `<div #resend_msg>
              <span>Your authentication code has been sent.</span>
              <button type="button" class="" aria-label="Dismiss this message" (click)="onClickResendBox($event)"
                name="X">
                X
              </button>
            </div>`,
  styleUrls: ['./auth2factor.component.css']
})
export class ResendBoxComponent {
  @ViewChild('resend_msg') resendMsg: ElementRef;
  constructor(private router: Router, private authService: AuthService) { }
  onClickResendBox(event: Event) {
    //this.resendMsg.nativeElement.remove();
  }
}*/
@Component({
  selector: 'app-auth2factor',
  templateUrl: './auth2factor.component.html',
  styleUrls: ['./auth2factor.component.css']
})
export class Auth2factorComponent implements OnInit {
  @ViewChild('parent') parentElement: ElementRef<HTMLInputElement>;
  //resendBox: ResendBoxComponent;
  user: UserI = this.sQuery.getUser();
  userEmail: string = "";
  c2f: CodeI = <CodeI>{};
  date_formated : string;
  show : boolean = false;
  boxMsg = '';
  constructor(private sQuery: LocalStorageQueryService,
              private authService: AuthService,
              private route: Router) { }
  async ngOnInit(): Promise<void> {
    this.partialHide();
    this.c2f = await this.authService.sendCode2Factor(this.user);
    this.date_formated =  this.toDateTime(this.c2f.expiration_time);
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
    const ret = await this.authService.validate2Factor(this.user);
    if (ret)
      this.route.navigateByUrl('/');
	else{
		this.boxMsg = "Oopsss bad code";
		this.show = true;
		}
  }
  async reSendCode(): Promise<void> {
  	this.c2f = await this.authService.reSendCode2Factor(this.user);
    this.date_formated =  this.toDateTime(this.c2f.expiration_time);


    this.show = true;
	  this.boxMsg = 'Your authentication code has been sent';
	/* let counter = 10;
	let intervalId = setInterval(() => {
		counter = counter - 1;
		console.log("msgBox wil close in: ", counter);
		if(counter === 0 || this.show == false) 
		{
			clearInterval(intervalId);
			this.show = false;
		}
	}, 1000) */
    //var node = document.createElement("div");
    //node.textContent = "Re-send";
    //this.parentElement.nativeElement.insertBefore(node, this.parentElement.nativeElement.firstChild);
  }
  toDateTime(secs : number): string {
    var str1 : string;
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs + 7200);
    str1 = t.toString();
    str1 = str1.substr(0, str1.indexOf('GMT'));
    return str1;
  }
  closeMsg(){
	  this.show = false;
	  this.boxMsg = '';
  }
}