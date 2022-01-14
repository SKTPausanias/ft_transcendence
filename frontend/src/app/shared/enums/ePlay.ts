export enum ePlay {
	ON_START_PLAY = "on-start-play",
	ON_STOP_PLAY = "on-stop-play",
	ON_REQUEST_INVITATION = "on-request-invitation",
	ON_ACCEPT_INVITATION = "on-accept-invitation",
	ON_DECLINE_INVITATION = "on-declien-invitation",
	ON_LOAD_ALL_GAME_INVITATIONS = "on-load-all-game-invitations",
	ON_PLAY_READY = "on-play-ready",
	ON_WAIT_ROOM_ACCEPT = "on-wait-room-accept",
	ON_WAIT_ROOM_REJECT = "on-wait-room-reject",
	ON_LOAD_ACTIVE_WAIT_ROOM = "on-load-active-wait-room"
}

export enum eRequestPlayer{
	WAITING = "waiting",
	ACCEPTED = "accepted",
	REJECTED = "rejected"
}