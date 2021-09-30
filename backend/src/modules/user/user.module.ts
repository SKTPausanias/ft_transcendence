import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { code2factor } from 'src/shared/entity/code2factor.entity';
import { friend } from 'src/shared/entity/friend.entity';
import { users } from 'src/shared/entity/user.entity';
import { LoginController } from './controller/auth/auth.controller';
import { UserController } from './user.controller';
import { UserService } from './user.service';


@Module({
    imports: [ TypeOrmModule.forFeature([users, code2factor, friend]), HttpModule ],
    controllers: [UserController, LoginController],
    providers: [UserService],
})
export class UserModule {}