import { UserPublicInfoI } from "../user/userI"
import { Ball } from "./classes/ball"
import { Paddle } from "./classes/paddle"

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

export interface MapI {
	width: number,
	height: number
}

export interface GameI {
	map: MapI,
	ball: BallI,
	pad_1: PadI,
	pad_2: PadI 
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