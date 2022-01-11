import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { SignUpComponent } from './auth/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { HomeComponent } from './home/home.component';
import { LeftNavComponent } from './home/left-nav/left-nav.component';
import { ContentComponent } from './home/content/content.component';
import { SettingsComponent } from './home/content/settings/settings.component';
import { ChatComponent } from './home/content/chat/chat.component';
import { LiveComponent } from './home/content/live/live.component';
import { PlayComponent } from './home/content/play/play.component';
import { DashboardComponent } from './home/content/dashboard/dashboard.component';
import { RightNavComponent } from './home/right-nav/right-nav.component';
import { HttpClientModule } from '@angular/common/http';
import { ConfirmationComponent } from './auth/confirmation/confirmation.component';
import { NotFoundComponent } from './shared/component/not-found/not-found.component';
import { LoadingComponent } from './shared/component/loading/loading.component';
import { AuthComponent } from './auth/auth.component';
import { TwoFactorComponent } from './auth/two-factor/two-factor.component';
import { FriendInvitationComponent } from './home/content/dashboard/notifications/friend-invitation/friend-invitation.component';
import { MessagingComponent } from './home/content/chat/messaging/messaging.component';
import { ChatModalComponent } from './home/content/chat/modal/chat-modal.component';
import { ChangePasswordComponent } from './home/content/chat/modal/change-password/change-password.component';
import { UserProfileComponent } from './home/content/chat/modal/user-profile/user-profile.component';
import { GameWaitRoomComponent } from './home/content/play/game-wait-room/game-wait-room.component';

@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    HomeComponent,
	LeftNavComponent,
	RightNavComponent,
	ContentComponent,
	SettingsComponent,
	ChatComponent,
	LiveComponent,
	PlayComponent,
	DashboardComponent,
	ConfirmationComponent,
	NotFoundComponent,
	LoadingComponent,
 	AuthComponent,
  TwoFactorComponent,
  FriendInvitationComponent,
  MessagingComponent,
  ChatModalComponent,
  ChangePasswordComponent,
  UserProfileComponent,
  GameWaitRoomComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
	FormsModule,
	HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
