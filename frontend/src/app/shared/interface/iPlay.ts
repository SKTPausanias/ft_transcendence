export interface WaitRoomI {
	id: number,
	player1: PlayerI,
	player2: PlayerI,
	expires : number
}
export interface PlayerI  {
	id: number,
	login: string,
	nickname: string,
	avatar: string,
	status: string
}