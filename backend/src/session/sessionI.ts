import { UserEntity } from "src/home/user/user.entity";

export interface SessionI {
    token: string; 
    expiration_time: number;
    userID: UserEntity;
}
export interface SessionInfoI {
    token: string; 
    expiration_time: number;
}