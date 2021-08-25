import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../../service/user/user.service';
import { UserController } from 'src/api/user/user.controller';
import { users } from 'src/entity/user.entity';

@Module({
    imports: [ TypeOrmModule.forFeature([users]) ],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
