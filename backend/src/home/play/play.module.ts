import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from 'src/session/session.entity';
import { SessionService } from 'src/session/session.service';
import { SocketService } from 'src/socket/socket.service';
import { ChatService } from '../chat/chat.service';
import { FriendEntity } from '../friends/friend.entity';
import { FriendService } from '../friends/friend.service';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { PlayController } from './play.controller';
import { ChatUsersEntity } from '../chat/entities/chatUsers.entity';
import { MessageEntity } from '../chat/entities/message.entity';
import { ActiveRoomEntity } from '../chat/entities/activeRoom.entity';
import { ChatEntity } from '../chat/entities/chat.entity';
import { UnreadMessageEntity } from '../chat/entities/unread-message.entity';
import { HashService } from 'src/shared/hash/hash.service';
import { PlayService } from './play.service';
import { PlayEntity } from './play.entity';
import { StatsEntity } from './stats.entity';
import { TwoFactorEntity } from 'src/auth/two-factor/two-factor.entity';

@Module({
	imports: [ TypeOrmModule.forFeature([UserEntity, SessionEntity, FriendEntity,
        ChatEntity, ChatUsersEntity, MessageEntity,
        ActiveRoomEntity, UnreadMessageEntity, PlayEntity, StatsEntity, TwoFactorEntity])],
	providers: [SocketService, SessionService, FriendService, UserService, ChatService, HashService, PlayService],

	controllers: [PlayController]
})
export class PlayModule {}