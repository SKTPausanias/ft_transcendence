import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './component/home/home.component'
import { LoginComponent } from './component/login/login.component'
import { NotFoundComponent } from './component/not-found/not-found.component'

const routes: Routes = [
	{ path: '',   redirectTo: '/home', pathMatch: 'full' },
	{ path: 'login', component: LoginComponent },
	{ path: 'home', component: HomeComponent },
	{ path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
