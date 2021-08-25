import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginController } from '../../api/login/login.controller';
import { UserService } from '../../service/user/user.service';
import { UserSchema } from '../../schema/user.schema';

@Module({
    imports: [ TypeOrmModule.forFeature([UserSchema]) ],
    controllers: [LoginController],
    providers: [UserService],
})
export class UserModule {}
