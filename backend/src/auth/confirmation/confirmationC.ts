//import conf from '../../../ft_config.json';

import { ConfirmationEntity } from "./confirmation.entity";
import { UserEntity } from "../../home/user/user.entity";
import { ConfirmationI } from "./confirmationI";
import { mDate } from "../../shared/utils/date";


export class Confirmation implements ConfirmationI {

    confirmation_nb: string;
    userID: UserEntity;
	expiration_time: number;

	constructor (private code: string, private user: UserEntity){
		this.confirmation_nb = code;
		this.userID = user;
		this.expiration_time = mDate.setExpirationTime(86400); //Math.round(Date.now() / 1000) + 86400;
	};
}