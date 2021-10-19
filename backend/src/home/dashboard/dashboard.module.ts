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

@Module({
    imports: [ TypeOrmModule.forFeature([UserEntity, SessionEntity, FriendEntity])],
    controllers: [DashboardController],
    providers: [
		DashboardService, UserService, SessionService, FriendService, SocketGateway
	]
})
export class DashboardModule {}
