import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/component/login.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
	HttpClientModule
  ],
  providers: [
	  {
		provide: 'SocialAuthServiceConfig',
		useValue: {
		  autoLogin: true, //keeps the user signed in
		  providers: [
			{
			  //id: GoogleLoginProvider.PROVIDER_ID,
			  //provider: new GoogleLoginProvider('148517665605-jspahbqleats6lv**********2c11b5g7o.apps.googleusercontent.com') // your client id
			}
		  ]
		}
	  }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
