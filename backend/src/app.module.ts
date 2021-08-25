import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { users } from './entity/user.entity';
import { UserModule } from './module/user/user.module';
import { LoginController } from './api/login/login.controller';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
	TypeOrmModule.forRoot({
		type: 'postgres',
		host: 'localhost',
		port: 5432,
		username: 'admin', //admin
		password: 'admin',		//admin
		database: 'ft_transcendence', //ft_transcendence
		entities: [users],
		autoLoadEntities: true,
		synchronize: true,
	}),
	HttpModule,
	UserModule,
  ],
  controllers: [AppController, LoginController],
  providers: [AppService],
})
export class AppModule {
	
}
