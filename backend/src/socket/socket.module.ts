import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from 'src/home/chat/entities/chat.entity';
import { ChatGateway } from 'src/home/chat/chat.gateway';
import { ChatService } from 'src/home/chat/chat.service';
import { MessageEntity } from 'src/home/chat/entities/message.entity';
import { FriendEntity } from 'src/home/friends/friend.entity';
import { FriendService } from 'src/home/friends/friend.service';
import { UserEntity } from 'src/home/user/user.entity';
import { UserService } from 'src/home/user/user.service';
import { SessionEntity } from 'src/session/session.entity';
import { SessionService } from 'src/session/session.service';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { ChatUsersEntity } from 'src/home/chat/entities/chatUsers.entity';
import { ActiveRoomEntity } from 'src/home/chat/entities/activeRoom.entity';

@Module({
	imports: [ TypeOrmModule.forFeature([UserEntity, SessionEntity, FriendEntity, ChatEntity, MessageEntity, ChatUsersEntity, ActiveRoomEntity ])],
	providers : [SocketGateway, SessionService, FriendService, SocketService, UserService, ChatService, ChatGateway]
})
export class SocketModule {}
