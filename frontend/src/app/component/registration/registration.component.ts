import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../../app.component'
import { LoginService } from '../../service/login/login.service'
import { UserI } from '../../model/interface/user';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

	user: UserI = this.appComponent.getUser();
	constructor(
		private appComponent: AppComponent,
		private loginService: LoginService,
		private router: Router) {}

	ngOnInit(): void {

	}

	async register(): Promise<void> {
		console.log("registrar pulsado");
		const response = await this.loginService.registerUser(this.user);
		this.router.navigateByUrl("/login");
		console.log(response);
		console.log("fin de tarea");



	}
}
