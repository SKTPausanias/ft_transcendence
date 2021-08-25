import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../../service/user/user.service';
import { UserController } from 'src/api/user/user.controller';
import { UserSchema } from '../../schema/user.schema'
@Module({
    imports: [ TypeOrmModule.forFeature([UserSchema]) ],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
