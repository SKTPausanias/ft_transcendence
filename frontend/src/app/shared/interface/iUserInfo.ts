
export interface UserInfoI {
	first_name: string;
	last_name: string;
	nickname: string;
	login: string;
	email: string;
	avatar: string;
	factor_enabled: boolean;
}
export interface UserPublicInfoI {
	first_name: string;
	last_name: string;
	nickname: string;
	avatar: string;
	online: boolean;
}