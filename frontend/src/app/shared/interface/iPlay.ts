import { UserPublicInfoI } from "./iUserInfo"

export interface WaitRoomI {
	id: number,
	player1: PlayerI,
	player2: PlayerI,
	expires : number,
	ready: boolean,
	viewers: UserPublicInfoI[]
}
export interface PlayerI  {
	id: number,
	login: string,
	nickname: string,
	avatar: string,
	status: string
}