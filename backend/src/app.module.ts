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
import { StatsEntity } from './home/chat/entities/stats.entity';

@Module({
  imports: [ConfigModule.forRoot({
	isGlobal: true,
	  //envFilePath: './.env_test',
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
					ActiveRoomEntity, UnreadMessageEntity, StatsEntity],
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
	  ChatModule
	],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}

/* 
	npm i --save @nestjs/config   
	npm i --save ajv   
	npm i --save ajv-keywords   
	npm i --save typeorm postgres pg   
	npm i --save @nestjs/typeorm   
	npm i --save @nestjs/serve-static   
	npm i --save nodemailer   
	npm i --save randomstring   
	npm i --save import @nestjs/axios   
	npm i --save speakeasy 
	npm i --save qrcode   



*/