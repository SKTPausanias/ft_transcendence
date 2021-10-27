import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SessionEntity } from "src/session/session.entity";
import { SessionService } from "src/session/session.service";
import { ChatEntity } from "../chat/chat.entity";
import { ChatService } from "../chat/chat.service";
import { MessageEntity } from "../chat/message.entity";
import { UserEntity } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { FriendEntity } from "./friend.entity";
import { FriendService } from "./friend.service";

@Module({
    imports: [ TypeOrmModule.forFeature([FriendEntity, UserEntity, ChatEntity, MessageEntity, SessionEntity])],
    controllers: [],
    providers: [FriendService, UserService, ChatService, SessionService]
})

export class friendModule {}