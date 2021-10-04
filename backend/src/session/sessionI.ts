import { UserEntity } from "src/shared/user/user.entity";

export interface SessionI {
    token: string; 
    expiration_time: number;
    userID: UserEntity;
}
export interface SessionInfoI {
    token: string; 
    expiration_time: number;
}