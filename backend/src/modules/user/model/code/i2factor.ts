import { users } from "src/shared/entity/user.entity";
import { IsNotEmpty } from 'class-validator'

export class pepe {
        id: number;
        @IsNotEmpty()
        code: string;
        creation_time: number;
        expiration_time: number;   
        userID: users;
}

export interface i2factor {
    id: number;
    code: string;
    creation_time: number;
    expiration_time: number;   
    userID: users;
}

export interface CodeI {
    creation_time: number;
    expiration_time: number;
    validated: boolean;
}