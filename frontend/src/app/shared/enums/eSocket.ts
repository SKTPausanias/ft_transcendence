export enum wSocket {
	CONNECT = 'connect',
	DISCONNECT = 'disconnect',
	FORCE_DISCONNECT = 'force-disconnect',
	SESSION_INIT = 'session-init',
	USER_UPDATE = 'user-update',
	USER_DELETE = 'user-delete',
	FRIEND_INVITATION = 'friend-invitation',
	FRIEND_DELETE = 'friend-delete',
	FRIEND_ACCEPT = 'friend-accept',

	ON_START = "on-start",
	ON_All_MSG = "on-all-msg",
	ON_NEW_MSG = "on-new-msg",
	ON_JOIN_ROOM = "on-join-room",



	CHAT_ON_START = 'chat-on-start',
	CHAT_ON_MSG = 'chat-on-msg',

}