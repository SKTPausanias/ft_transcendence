import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { AuthModule } from '../auth/auth.module';
import { LeftNavComponent } from './components/left-nav/left-nav.component';
import { RightNavComponent } from './components/right-nav/right-nav.component';
import { ContentComponent } from './components/content/content.component';
import { SettingsComponent } from './components/content/settings/settings.component';
import { InfoComponent } from './components/content/info/info.component';
import { GameComponent } from './components/content/game/game.component';
import { LiveComponent } from './components/content/live/live.component';
import { ChatComponent } from './components/content/chat/chat.component';

@NgModule({
  declarations: [
    HomeComponent,
    LeftNavComponent,
    RightNavComponent,
    ContentComponent,
    SettingsComponent,
    InfoComponent,
    GameComponent,
    LiveComponent,
    ChatComponent
  ],
  imports: [
    CommonModule,
	AuthModule
  ]
})
export class HomeModule { }
