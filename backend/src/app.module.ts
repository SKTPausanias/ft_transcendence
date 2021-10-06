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
import { UserEntity } from './shared/user/user.entity';
import { SessionModule } from './session/session.module';
import { SessionEntity } from './session/session.entity';
import { SettingsModule } from './home/settings/settings.module';

@Module({
  imports: [ConfigModule.forRoot({
	  //envFilePath: './.env_test',
  }),
	TypeOrmModule.forRoot({
		type: 'postgres',
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		username: process.env.DB_USER, 
		password: process.env.DB_PASS,		
		database: process.env.DB, 
		entities: [UserEntity, ConfirmationEntity, TwoFactorEntity, SessionEntity],
		autoLoadEntities: true,
		synchronize: true,
	}),
 	ServeStaticModule.forRoot({
		rootPath: join(__dirname, '..', 'public')
	  }),
	  AuthModule,
	  SessionModule,
	  SettingsModule
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