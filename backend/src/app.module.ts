import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfirmationEntity } from './auth/confirmation/confirmation.entity';
import { TwoFactorEntity } from './auth/two-factor/two-factor.entity';
import { UserEntity } from './home/user/user.entity';
import { SessionEntity } from './session/session.entity';
import { SettingsModule } from './home/settings/settings.module';
import { UserModule } from './home/user/user.module';
import { FriendEntity } from './home/friends/friend.entity';
import { DashboardModule } from './home/dashboard/dashboard.module';
import { SocketModule } from './socket/socket.module';
import { ChatModule } from './home/chat/chat.module';
import { ChatEntity } from './home/chat/entities/chat.entity';
import { MessageEntity } from './home/chat/entities/message.entity';
import { ChatUsersEntity } from './home/chat/entities/chatUsers.entity';
import { ActiveRoomEntity } from './home/chat/entities/activeRoom.entity';
import { UnreadMessageEntity } from './home/chat/entities/unread-message.entity';
import { StatsEntity } from './home/play/stats.entity';
import { PlayModule } from './home/play/play.module';
import {PlayEntity } from './home/play/play.entity'

@Module({
  imports: [ConfigModule.forRoot({
	isGlobal: true,
	  //envFilePath: './.env_local',
  }),
	TypeOrmModule.forRoot({
		type: 'postgres',
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		username: process.env.DB_USER, 
		password: process.env.DB_PASS,		
		database: process.env.DB, 
		entities: [UserEntity, ConfirmationEntity, TwoFactorEntity, SessionEntity, 
					FriendEntity, ChatEntity, ChatUsersEntity, MessageEntity, 
					ActiveRoomEntity, UnreadMessageEntity, StatsEntity, PlayEntity],
		autoLoadEntities: true,
		synchronize: true,
	}),
 	ServeStaticModule.forRoot({
		rootPath: join(__dirname, '..', 'public')
	  }),
	  AuthModule,
	  SettingsModule,
	  UserModule,
	  DashboardModule,
	  SocketModule,
	  ChatModule,
	  PlayModule
	],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}