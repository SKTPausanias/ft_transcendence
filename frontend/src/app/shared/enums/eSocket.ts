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
	CHAT_MESSAGE = 'chat-message',
}