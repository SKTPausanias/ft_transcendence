import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserService } from '../../service/user/user.service';
import { UserController } from 'src/api/user/user.controller';
import { users } from 'src/entity/user.entity';
import { HttpModule } from '@nestjs/axios';
import { LoginController } from 'src/api/login/login.controller';

@Module({
    imports: [ TypeOrmModule.forFeature([users]), HttpModule ],
    controllers: [UserController, LoginController],
    providers: [UserService],
})
export class UserModule {}
