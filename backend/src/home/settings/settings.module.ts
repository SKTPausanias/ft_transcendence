import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/home/user/user.entity';
import { UserService } from 'src/home/user/user.service';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SessionEntity } from 'src/session/session.entity'; 
import { SessionService } from 'src/session/session.service';
import { TwoFactorService } from 'src/auth/two-factor/two-factor.service';
import { MailService } from 'src/shared/mail/mail.service';
import { TwoFactorEntity } from 'src/auth/two-factor/two-factor.entity';
import { FriendEntity } from '../friends/friend.entity';
import { FriendService } from '../friends/friend.service';
import { ActiveRoomEntity } from '../chat/entities/activeRoom.entity';
import { ChatUsersEntity } from '../chat/entities/chatUsers.entity';
import { UnreadMessageEntity } from '../chat/entities/unread-message.entity';
import { MessageEntity } from '../chat/entities/message.entity';
import { ChatService } from '../chat/chat.service';
import { ChatEntity } from '../chat/entities/chat.entity';
import { HashService } from 'src/shared/hash/hash.service';

@Module({
    imports: [ TypeOrmModule.forFeature([UserEntity, SessionEntity, TwoFactorEntity, FriendEntity, ActiveRoomEntity, ChatUsersEntity, UnreadMessageEntity, MessageEntity, ChatEntity])],
    controllers: [SettingsController],
    providers: [
		SettingsService, UserService, SessionService, TwoFactorService, MailService, FriendService, ChatService, HashService
	]
})
export class SettingsModule {}
