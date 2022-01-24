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

export interface GameMoveableI {
	pos_x: number,
	pos_y: number,
	width: number,
	height: number
}

export interface PadI extends GameMoveableI {

}

export interface BallI extends GameMoveableI {

}