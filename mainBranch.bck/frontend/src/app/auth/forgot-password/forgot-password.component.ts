import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-forgot-password',
	templateUrl: './forgot-password.component.html',
	styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
	email: string;
	nickname: string;
	constructor(private router: Router) {}

	ngOnInit(): void {}
	reset(data:any){
		console.log(data);
	}
	back(){
		this.router.navigateByUrl('logIn');
	}
}
