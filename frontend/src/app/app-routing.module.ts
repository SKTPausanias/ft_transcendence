import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { AuthComponent } from './modules/auth/auth.component';
import { LoginComponent } from './modules/auth/components/login/login.component';
import { RegistrationComponent } from './modules/auth/components/registration/registration.component';
import { ConfirmationComponent } from './modules/auth/components/confirmation/confirmation.component';

const routes: Routes = [
	{ path: '', component: RegistrationComponent},
	//{ path: '', component: HomeComponent},
	{ path: 'home', redirectTo: '', pathMatch: 'full'},
	{ path: 'auth', component: AuthComponent,
	children: [
		{ path: 'login', component: LoginComponent },
		{ path: 'registration',	component: RegistrationComponent },
		{ path: 'confirmation',	component: ConfirmationComponent }
	] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
