import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';
import { UserI } from 'src/app/shared/interface/user';
import { AuthService } from '../../auth.service';
import { CodeI } from '../../../../shared/interface/c2f';

@Component({
  selector: 'app-auth2factor',
  templateUrl: './auth2factor.component.html',
  styleUrls: ['./auth2factor.component.css']
})
export class Auth2factorComponent implements OnInit {

  user: UserI = this.sQuery.getUser();
  userEmail: string = "";
  c2f: CodeI = <CodeI>{};

  constructor(private sQuery: LocalStorageQueryService,
              private authService: AuthService,
              private route: Router) { }

  async ngOnInit(): Promise<void> {
    this.partialHide();
    this.c2f = await this.authService.sendCode2Factor(this.user);
    
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
    console.log("Llego...");
    this.c2f = await this.authService.reSendCode2Factor(this.user);
    console.log("from oninit auth2factor: ", this.c2f);
  }
}
