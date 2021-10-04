import { SessionEntity } from "src/session/session.entity";

export interface UserI {
    ft_id: number;	
    first_name: string;    
    last_name: string;	
    email: string;
    nickname: string;
    password: string;
    role: string;
    avatar: string;
    factor_enabled: boolean;
    confirmed: boolean;
	sesionID: SessionEntity;
}

export interface UserRegI {
	first_name: string;
	last_name: string;
	nickname: string;
	email: string;
	password: string;
	factor_enabled: boolean;
}
export interface UserInfoI {
    first_name: string;    
    last_name: string;	
    email: string;
    nickname: string;
    avatar: string;
}