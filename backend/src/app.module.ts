import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { users } from './shared/entity/user.entity';

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
		entities: [users],
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
