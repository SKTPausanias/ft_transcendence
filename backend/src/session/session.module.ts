import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HashService } from 'src/shared/hash/hash.service';
import { UserEntity } from 'src/shared/user/user.entity';
import { UserService } from 'src/shared/user/user.service';
import { SessionController } from './session.controller';
import { SessionEntity } from './session.entity';
import { SessionService } from './session.service';

@Module({
	imports: [ TypeOrmModule.forFeature([UserEntity, SessionEntity])],
    controllers: [SessionController],
    providers: [
		SessionService, UserService, SessionEntity
	]
})
export class SessionModule {}

