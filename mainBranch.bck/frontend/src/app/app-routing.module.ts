import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { ConfirmationComponent } from './auth/confirmation/confirmation.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { TwoFactorComponent } from './auth/two-factor/two-factor.component';
import { ChatComponent } from './home/content/chat/chat.component';
import { ContentComponent } from './home/content/content.component';
import { LiveComponent } from './home/content/live/live.component';
import { PlayComponent } from './home/content/play/play.component';
import { SettingsComponent } from './home/content/settings/settings.component';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './shared/component/not-found/not-found.component';

const routes: Routes = [
	{path: 'home',   redirectTo: '', pathMatch: 'full' },
	{path: '', component: HomeComponent,
	children: [
		{path: 'play', component: PlayComponent},
		{path: 'live', component: LiveComponent},
		{path: 'chat', component: ChatComponent},
		{path: 'settings', component: SettingsComponent},
	]},
	{path: 'logIn', component: SignInComponent},
	{path: 'signUp', component: SignUpComponent},
	{path: 'password-reset', component: ForgotPasswordComponent},
	{path: 'confirmation', component: ConfirmationComponent},
	{path: 'auth', component: AuthComponent},
	{path: 'twoFactor', component: TwoFactorComponent},
	{path: '**', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
