import { UserEntity } from "../user/user.entity";
import { UserPublicInfoI } from "../user/userI";
import { ChatEntity } from "./chat.entity";

export interface messageI {
    message: string,
    userId: UserEntity,
    chatId: ChatEntity,
}