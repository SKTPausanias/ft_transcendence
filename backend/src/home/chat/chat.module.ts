import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/home/user/user.entity';
import { UserService } from 'src/home/user/user.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SessionEntity } from 'src/session/session.entity'; 
import { SessionService } from 'src/session/session.service';

@Module({
    imports: [ TypeOrmModule.forFeature([UserEntity, SessionEntity])],
    controllers: [ChatController],
    providers: [
		ChatService, UserService, SessionService
	]
})
export class ChatModule {}
