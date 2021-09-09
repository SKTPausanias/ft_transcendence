import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { AuthComponent } from './modules/auth/auth.component';
import { LoginComponent } from './modules/auth/components/login/login.component';
import { RegistrationComponent } from './modules/auth/components/registration/registration.component';
import { ConfirmationComponent } from './modules/auth/components/confirmation/confirmation.component';
import { InfoComponent } from './modules/home/components/content/info/info.component';
import { PlayComponent } from './modules/home/components/content/play/play.component';
import { LiveComponent } from './modules/home/components/content/live/live.component';
import { ChatComponent } from './modules/home/components/content/chat/chat.component';
import { SettingsComponent } from './modules/home/components/content/settings/settings.component';
import { Auth2factorComponent } from './modules/auth/components/auth2factor/auth2factor.component';

const routes: Routes = [
	{ path: '', component: HomeComponent,
	children: [
		{path: 'play', component: PlayComponent},
		{path: 'live', component: LiveComponent},
		{path: 'chat', component: ChatComponent},
		{path: 'settings', component: SettingsComponent},
	]},
	{ path: 'home', redirectTo: '', pathMatch: 'full'},
	{ path: 'auth', component: AuthComponent,
	children: [
		{ path: 'login', component: LoginComponent },
		{ path: 'registration',	component: RegistrationComponent },
		{ path: 'confirmation',	component: ConfirmationComponent },
		{ path: 'auth2factor',	component: Auth2factorComponent }
	] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
