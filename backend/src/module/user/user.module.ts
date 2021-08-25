import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../../service/user/user.service';
import { UserEntity } from 'src/entity/user.entity'; 
import { UserController } from 'src/api/user/user.controller';

@Module({
    imports: [ TypeOrmModule.forFeature([UserEntity]) ],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
