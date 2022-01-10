export enum wSocket {
	SESSION_INIT = 'session-init',
	USER_UPDATE = 'user-update',
	USER_DELETE = 'user-delete',
	FRIEND_INVITATION = 'friend-invitation',
	FRIEND_DELETE = 'friend-delete',
	FRIEND_ACCEPT = 'friend-accept',
	CHAT_MESSAGE = 'chat-message',
	CHAT_GROUP_MESSAGE = 'chat-group-message',
	CHAT_BLOCK_USER = 'chat-block-user',
	CHAT_MUTE_USER = 'chat-mute-user',
	CHAT_BAN_USER = 'chat-ban-user',
	GAME_POSITION = 'game-position'
}