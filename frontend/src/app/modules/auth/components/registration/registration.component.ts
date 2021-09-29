import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserI } from 'src/app/shared/interface/user';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';
import { AuthService } from '../../auth.service';

@Component({
selector: 'app-registration',
templateUrl: './registration.component.html',
styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit {
	@ViewChild('nickname_input') nickElement: ElementRef<HTMLInputElement>;
	@ViewChild('email_input') emailElement: ElementRef<HTMLInputElement>;
	user: UserI = this.sQuery.getUser();
	nickname: string;
	email: string;
	show: boolean = false;
	update_message : string = "";
	constructor(
		private sQuery: LocalStorageQueryService,
		private router: Router,
		private authService: AuthService
	) {}

	ngOnInit(): void {
		console.log('OnInit: Registration: ', this.user);
	}

	async onSubmitRegister(value: any)
	{
		this.user.nickname = value.nickname;
		/*const user = await this.authService.registerUser(this.user);
		console.log("User from frontend registration: ", this.user);
		if (Object.keys(user).length){
			this.user = user;
			this.sQuery.setUser(this.user);
			this.router.navigateByUrl('/');
		}*/
		
		const result = await this.authService.registerUser(this.user);
		if (result.ok == false)
		{
			this.show = true;
			this.update_message = "Registration error";
		}
		else
		{
			this.user = result;
			this.sQuery.setUser(this.user);
			this.router.navigateByUrl('/');
		}
	}
	nicknameCheckbox(e: any){
		if (e.target.checked)
		{
			this.nickname = this.user.login;
			this.nickElement.nativeElement.readOnly = true;
		}
		else
		{
			this.nickname = '';
			this.nickElement.nativeElement.readOnly = false;
		}
	}
	emailCheckbox(e: any){

		if (e.target.checked)
		{
			this.email = this.user.email;
			this.emailElement.nativeElement.readOnly = true;
		}
		else
		{
			this.email = '';
			this.emailElement.nativeElement.readOnly = false;
		}
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
