import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from 'src/session/session.entity';
import { SessionService } from 'src/session/session.service';
import { FriendEntity } from '../chat/chat.entity';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Module({
imports: [ TypeOrmModule.forFeature([UserEntity, SessionEntity, FriendEntity])],
  controllers: [UserController],
  providers: [
	UserService, SessionService
]
})
export class UserModule {}
