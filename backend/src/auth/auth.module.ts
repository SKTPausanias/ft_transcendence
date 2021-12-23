import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfirmationEntity } from 'src/auth/confirmation/confirmation.entity';
import { UserEntity } from 'src/home/user/user.entity';
import { HashService } from 'src/shared/hash/hash.service';
import { MailService } from 'src/shared/mail/mail.service';
import { UserService } from 'src/home/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfirmService } from './confirmation/confirmation.service';
import { FtAuthService } from './ft_auth/ft_auth.service';
import { TwoFactorService } from './two-factor/two-factor.service';
import { TwoFactorEntity } from './two-factor/two-factor.entity';
import { SessionService } from 'src/session/session.service';
import { SessionEntity } from 'src/session/session.entity';
import { FriendEntity } from 'src/home/friends/friend.entity';
import { FriendService } from 'src/home/friends/friend.service';
import { ActiveRoomEntity } from 'src/home/chat/entities/activeRoom.entity';
import { ChatUsersEntity } from 'src/home/chat/entities/chatUsers.entity';
import { UnreadMessageEntity } from 'src/home/chat/entities/unread-message.entity';
import { MessageEntity } from 'src/home/chat/entities/message.entity';
import { ChatService } from 'src/home/chat/chat.service';
import { ChatEntity } from 'src/home/chat/entities/chat.entity';

@Module({
	imports: [ TypeOrmModule.forFeature([UserEntity, ConfirmationEntity, TwoFactorEntity, SessionEntity, FriendEntity, ActiveRoomEntity, ChatUsersEntity, UnreadMessageEntity, MessageEntity, ChatEntity]), HttpModule],
    controllers: [AuthController],
    providers: [
		UserService, ConfirmService, 
		AuthService, HashService, 
		MailService, FtAuthService, TwoFactorService,
		SessionService, FriendService,
		ChatService
	],
})
export class AuthModule {}
