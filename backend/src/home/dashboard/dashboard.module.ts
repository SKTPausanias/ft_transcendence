import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/home/user/user.entity';
import { UserService } from 'src/home/user/user.service';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { SessionEntity } from 'src/session/session.entity'; 
import { SessionService } from 'src/session/session.service';
import { FriendEntity } from '../friends/friend.entity';
import { FriendService } from '../friends/friend.service';
import { SocketGateway } from 'src/socket/socket.gateway';
import { SocketService } from 'src/socket/socket.service';
import { ActiveRoomEntity } from '../chat/entities/activeRoom.entity';
import { ChatUsersEntity } from '../chat/entities/chatUsers.entity';
import { UnreadMessageEntity } from '../chat/entities/unread-message.entity';
import { MessageEntity } from '../chat/entities/message.entity';
import { ChatService } from '../chat/chat.service';
import { ChatEntity } from '../chat/entities/chat.entity';
import { HashService } from 'src/shared/hash/hash.service';

@Module({
    imports: [ TypeOrmModule.forFeature([UserEntity, SessionEntity, FriendEntity, ActiveRoomEntity, ChatUsersEntity, UnreadMessageEntity, MessageEntity, ChatEntity])],
    controllers: [DashboardController],
    providers: [
		DashboardService, UserService, SessionService, FriendService, ChatService, HashService
	]
})
export class DashboardModule {}
