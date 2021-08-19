import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponentComponent } from './login-component/login-component.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponentComponent
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
