import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from 'src/session/session.entity';
import { SessionService } from 'src/session/session.service';
import { SocketService } from 'src/socket/socket.service';
import { FriendEntity } from '../friends/friend.entity';
import { FriendService } from '../friends/friend.service';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ChatEntity } from './entities/chat.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatUsersEntity } from './entities/chatUsers.entity';
import { MessageEntity } from './entities/message.entity';
import { ChatController } from './chat.controller';
import { ActiveRoomEntity } from './entities/activeRoom.entity';
import { HashService } from 'src/shared/hash/hash.service';
import { UnreadMessageEntity } from './entities/unread-message.entity';

@Module({
	imports: [ TypeOrmModule.forFeature([UserEntity, SessionEntity, FriendEntity,
										ChatEntity, ChatUsersEntity, MessageEntity,
										ActiveRoomEntity, UnreadMessageEntity])],
	providers: [SocketService, SessionService, FriendService, UserService, ChatService, HashService],
	controllers: [ChatController]
})
export class ChatModule {}
