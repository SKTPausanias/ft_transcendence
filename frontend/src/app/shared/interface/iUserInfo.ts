
export interface UserInfoI {
	first_name: string;
	last_name: string;
	nickname: string;
	login: string;
	email: string;
	avatar: string;
	factor_enabled: boolean;
	in_game: boolean;
}
export interface UserPublicInfoI {
	login: string,
	first_name: string;
	last_name: string;
	nickname: string;
	avatar: string;
	online: boolean;
	in_game: boolean;
}