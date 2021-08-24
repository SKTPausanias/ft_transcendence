import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeComponent } from './component/home/home.component'
import { LoginComponent } from './component/login/login.component'
import { NotFoundComponent } from './component/not-found/not-found.component'
import { UnauthorizedComponent } from './component/unauthorized/unauthorized.component'
import { LoadingComponent } from './component/loading/loading.component'
import { RegistrationComponent } from './component/registration/registration.component'
import { ConfirmationComponent } from './component/confirmation/confirmation.component'

const routes: Routes = [
	//{ path: '',   redirectTo: '/home', pathMatch: 'full' },
	//{ path: '', component: AppComponent },
	{ path: '', component: HomeComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'registration', component: RegistrationComponent },
	{ path: 'confirmation', component: ConfirmationComponent },
	{ path: 'unauthorized', component: UnauthorizedComponent },
	{ path: 'loading', component: LoadingComponent },
	{ path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
