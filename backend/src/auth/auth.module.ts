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
import { FriendEntity } from 'src/home/chat/chat.entity';

@Module({
	imports: [ TypeOrmModule.forFeature([UserEntity, ConfirmationEntity, TwoFactorEntity, SessionEntity, FriendEntity]), HttpModule],
    controllers: [AuthController],
    providers: [
		UserService, ConfirmService, 
		AuthService, HashService, 
		MailService, FtAuthService, TwoFactorService,
		SessionService
	],
})
export class AuthModule {}
