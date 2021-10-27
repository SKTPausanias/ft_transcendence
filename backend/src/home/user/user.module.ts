import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from 'src/session/session.entity';
import { SessionService } from 'src/session/session.service';
import { ChatEntity } from '../chat/chat.entity';
import { ChatService } from '../chat/chat.service';
import { MessageEntity } from '../chat/message.entity';
import { FriendEntity } from '../friends/friend.entity';
import { FriendService } from '../friends/friend.service';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [ TypeOrmModule.forFeature([UserEntity, SessionEntity, FriendEntity, ChatEntity, MessageEntity])],
    controllers: [UserController],
    providers: [
    UserService, SessionService, FriendService, ChatService
  ]
})
export class UserModule {}
