import { UserEntity } from "../../shared/user/user.entity";

export interface ConfirmationI {
    confirmation_nb: string;
	expiration_time: number;
    userID: UserEntity;
}