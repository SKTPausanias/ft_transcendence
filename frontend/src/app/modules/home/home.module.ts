import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { AuthModule } from '../auth/auth.module';
import { LeftNavComponent } from './components/left-nav/left-nav.component';
import { RightNavComponent } from './components/right-nav/right-nav.component';
import { ContentComponent } from './components/content/content.component';

@NgModule({
  declarations: [
    HomeComponent,
    LeftNavComponent,
    RightNavComponent,
    ContentComponent
  ],
  imports: [
    CommonModule,
	AuthModule
  ]
})
export class HomeModule { }
