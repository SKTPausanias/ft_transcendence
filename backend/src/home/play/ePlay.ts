export enum ePlay {
	ON_LOAD_ALL_GAME_INVITATIONS = "on-load-all-game-invitations",
	ON_LOAD_ACTIVE_WAIT_ROOM = "on-load-active-wait-room",
	ON_REQUEST_INVITATION = "on-request-invitation",
	ON_ACCEPT_INVITATION = "on-accept-invitation",
	ON_DECLINE_INVITATION = "on-declien-invitation",
	ON_WAIT_ROOM_ACCEPT = "on-wait-room-accept",
	ON_WAIT_ROOM_REJECT = "on-wait-room-reject",
	ON_GET_LIVE_GAMES = "on-get-live-games",
	ON_START_STREAM = "on-start-stream",
	ON_STOP_STREAM = "on-stop-stream",
	ON_GAME_END = "on-game-end",
	ON_MATCH_DATA = "on-match-data",
	ON_MATCH_DATA_BALL = "on-match-data-ball",
	ON_MATCH_DATA_P1 = "on-match-data-p1",
	ON_MATCH_DATA_P2 = "on-match-data-p2",
	ON_START_GAME = "on-start-game",
	ON_GAME_MOVING = "on-game-moving",
	ON_PADD_MOVE = "on-pad-move",
	ON_GAME_LOSER = "on-game-loser",
	ON_GAME_WINNER = "on-game-winner",
	ON_MATCH_MAKING = "on-match-making",
	ON_CANCEL_MATCH_MAKING = "on-cancel-match-making",
	ON_SELECT_PLAY_MODE = "on-select-play-mode",
	ON_SET_LIVE_VIEWERS = "on-set-live-viewers",
	ON_GET_LIVE_VIEWERS = "on-get-live-viewers",
	ON_GET_RANKING = "on-get-ranking",
	ON_GET_INFO_SYSTEM = "on-get-info-system"
}
export enum eRequestPlayer{
	WAITING = "waiting",
	ACCEPTED = "accepted",
	REJECTED = "rejected"
}
export enum ePlayMode{
	CLASIC = 1,
	POWER = 2,
	ANGLE = 3
}