import { UserEntity } from "../user/user.entity";
import { ChatEntity } from "./chat.entity";

export interface messageI {
    message: string,
    userId: UserEntity,
    chatId: ChatEntity,
}