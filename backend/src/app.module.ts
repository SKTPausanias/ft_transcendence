import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

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
		autoLoadEntities: true,
		synchronize: true
	}),
	HttpModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
