export enum Storage {
	USER = 'user',
	SESSION_TOKEN = 'sessionToken',
	STATUS = 'status',
}
export enum UserRole {
	USER = 'User',
	ADMIN = 'Admin'
}
export enum UserStatus {
	UNREGISTERED = 1,
	UNCONFIRMED = 2,
	CONFIRMED = 3
}
export enum Nav {
	HOME = '/',
	GAME = '/play',
	LIVE = '/live',
	CHAT = '/chat',
	CONF = '/settings'
}