import { UserPublicInfoI } from "./iUserInfo";

export interface messageI {
    chatID: string,
    message: string,
    userID: any,
    receiver: string,
    timestamp: number
  }

  export interface MessagesI {
    message: string,
    date: number,
    msgDateString: string,
    owner: string,
    user: UserPublicInfoI,
  }

  export interface ChannelI {
    name_chat: string,
    chat_type: string
    protected: boolean,
    password: string,
    members: UserPublicInfoI[]
  }