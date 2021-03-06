export enum wSocket {
	CONNECT = 'connect',
	DISCONNECT = 'disconnect',
	CONNECT_USER = 'connect-user',
	DISCONNECT_USER = 'disconnect-user',
	FORCE_DISCONNECT = 'force-disconnect',
	SESSION_INIT = 'session-init',
	USER_UPDATE = 'user-update',
	USER_DELETE = 'user-delete',
	FRIEND_INVITATION = 'friend-invitation',
	FRIEND_DELETE = 'friend-delete',
	FRIEND_ACCEPT = 'friend-accept',
	CHAT_ON_START = 'chat-on-start',
	CHAT_ON_MSG = 'chat-on-msg',
	ON_FORCE_UPDATE = "on-force-update",
	CLOSE_SESSIONS = "on-close-sessions"
}