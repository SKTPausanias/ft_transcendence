import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { AuthComponent} from './auth.component';
import { LoadingComponent } from './components/loading/loading.component';
import { FormsModule } from '@angular/forms'


@NgModule({
  declarations: [
    AuthComponent,
    LoginComponent,
    RegistrationComponent,
    ConfirmationComponent,
    LoadingComponent
  ],
  imports: [
    CommonModule,
	FormsModule,
  ],
  exports: [AuthComponent]
})
export class AuthModule { }
