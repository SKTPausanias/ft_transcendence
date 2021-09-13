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

  constructor(private sQuery: LocalStorageQueryService,
              private authService: AuthService,
              private route: Router) { }

  ngOnInit(): void {
    this.partialHide();
    this.authService.sendCode2Factor(this.user);
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

  reSendCode(): void {
    this.authService.reSendCode2Factor(this.user);
  }
}
