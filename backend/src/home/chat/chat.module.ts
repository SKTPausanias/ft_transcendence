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

@Module({
	imports: [ TypeOrmModule.forFeature([UserEntity, SessionEntity, FriendEntity, ChatEntity, ChatUsersEntity, MessageEntity])],
	providers: [SocketService, SessionService, FriendService, UserService, ChatService],

})
export class ChatModule {}
