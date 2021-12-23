import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from 'src/session/session.entity';
import { SessionService } from 'src/session/session.service';
import { ChatEntity } from '../chat/entities/chat.entity';
import { ChatService } from '../chat/chat.service';
import { MessageEntity } from '../chat/entities/message.entity';
import { FriendEntity } from '../friends/friend.entity';
import { FriendService } from '../friends/friend.service';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { ActiveRoomEntity } from '../chat/entities/activeRoom.entity';
import { ChatUsersEntity } from '../chat/entities/chatUsers.entity';
import { UnreadMessageEntity } from '../chat/entities/unread-message.entity';
import { HashService } from 'src/shared/hash/hash.service';

@Module({
imports: [ TypeOrmModule.forFeature([UserEntity, SessionEntity, FriendEntity, ActiveRoomEntity, ChatUsersEntity, UnreadMessageEntity, MessageEntity, ChatEntity])],
  controllers: [UserController],
  providers: [
	UserService, SessionService, FriendService, ChatService, HashService
]
})
export class UserModule {}
