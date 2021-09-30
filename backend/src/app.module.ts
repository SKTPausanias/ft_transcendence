import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { users } from './shared/entity/user.entity';
import { code2factor } from './shared/entity/code2factor.entity';
import { friend } from './shared/entity/friend.entity';
import { match_history } from './shared/entity/match_history.entity';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
	TypeOrmModule.forRoot({
		type: 'postgres',
		//host: '192.168.1.12',
		host: 'localhost',
		port: 5432,
		username: 'admin', //admin
		password: 'admin',		//admin
		database: 'ft_transcendence', //ft_transcendence
		entities: [users, code2factor, friend, match_history],
//		autoLoadEntities: true,
		synchronize: true,
	}),
	HttpModule,
	UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
	
}
