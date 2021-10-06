import { UserRegI } from "./userI";

export class UserClass{

	static getUser(values: any){
		let user = <UserRegI>{};
		user.first_name = values.first_name;
		user.last_name = values.last_name;
		user.nickname = values.login;
		user.login = values.login;
		user.email = values.email;
		user.password = values.password;
		user.factor_enabled = values.factor_enabled;
		return (user)
	}
}