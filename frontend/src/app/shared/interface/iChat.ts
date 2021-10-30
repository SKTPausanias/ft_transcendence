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
    friend: UserPublicInfoI,
  }