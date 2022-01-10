import { UserEntity } from "../../home/user/user.entity";

export interface ConfirmationI {
    confirmation_nb: string;
	expiration_time: number;
    userID: UserEntity;
}