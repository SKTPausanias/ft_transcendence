import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';
import { UserI } from 'src/app/shared/interface/user';
import { AuthService } from '../../auth.service';
import { CodeI } from '../../../../shared/interface/c2f';
import { stringify } from '@angular/compiler/src/util';

@Component({
  selector: 'app-auth2factor',
  templateUrl: './auth2factor.component.html',
  styleUrls: ['./auth2factor.component.css']
})
export class Auth2factorComponent implements OnInit {
  @ViewChild('parent') parentElement: ElementRef<HTMLInputElement>;
  user: UserI = this.sQuery.getUser();
  userEmail: string = "";
  c2f: CodeI = <CodeI>{};
  date_formated : string;

  constructor(private sQuery: LocalStorageQueryService,
              private authService: AuthService,
              private route: Router) { }

  async ngOnInit(): Promise<void> {
    this.partialHide();
    console.log("parentElement: ",this.parentElement);
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
  }

  async reSendCode(): Promise<void> {
    this.c2f = await this.authService.reSendCode2Factor(this.user);
    this.date_formated =  this.toDateTime(this.c2f.expiration_time);
  }

  toDateTime(secs : number): string {
    var str1 : string;
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs + 7200);
    str1 = t.toString();
    str1 = str1.substr(0, str1.indexOf('GMT'));
    return str1;
  }
}
