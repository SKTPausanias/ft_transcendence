import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendEntity } from 'src/home/friends/friend.entity';
import { FriendService } from 'src/home/friends/friend.service';
import { UserEntity } from 'src/home/user/user.entity';
import { SessionEntity } from 'src/session/session.entity';
import { SessionService } from 'src/session/session.service';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';

@Module({
	imports: [ TypeOrmModule.forFeature([UserEntity, SessionEntity, FriendEntity])],
	providers : [SocketGateway, SessionService, FriendService, SocketService]
})
export class SocketModule {}
