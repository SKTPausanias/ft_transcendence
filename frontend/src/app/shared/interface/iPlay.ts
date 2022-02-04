import { UserPublicInfoI } from "./iUserInfo"

export interface WaitRoomI {
	id: number,
	player1: PlayerI,
	player2: PlayerI,
	expires : number,
	ready: boolean,
	selecting: string,
	play_modes: number[],
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

export interface GameDataI{
	id: number,
	up: boolean | undefined,
	down: boolean | undefined,
	p1: boolean
}

export interface MapI {
	width: number,
	height: number
}

export interface GameI {
	map: MapI,
	ball: BallI,
	pad_1: PadI,
	pad_2: PadI,
	score_p1: number,
	score_p2: number,
	hits_p1: number,
	hits_p2: number,
	gameFinished: boolean
}