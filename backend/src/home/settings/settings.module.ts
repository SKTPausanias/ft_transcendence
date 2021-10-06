import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/shared/user/user.entity';
import { UserService } from 'src/shared/user/user.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SessionEntity } from 'src/session/session.entity'; 
import { SessionService } from 'src/session/session.service';

@Module({
    imports: [ TypeOrmModule.forFeature([UserEntity, SessionEntity])],
    controllers: [SettingsController],
    providers: [
		SettingsService, UserService, SessionService
	]
})
export class SettingsModule {}
