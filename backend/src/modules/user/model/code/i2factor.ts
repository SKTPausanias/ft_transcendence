import { users } from "src/shared/entity/user.entity";

export interface i2factor {
    id: number;
    code: string;
    creation_time: number;
    expiration_time: number;   
    userID: users;
}