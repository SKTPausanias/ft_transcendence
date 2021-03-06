export enum eChat {
	ON_START = "on-start",
	ON_JOIN_ROOM = "on-join-room",
	ON_LEAVE_ROOM = "on-leave-room",
	ON_LOAD_ACTIVE_ROOMS = "on-load-active-rooms",
	ON_All_MSG = "on-all-msg",
	ON_NEW_MSG = "on-new-msg",
	ON_UPDATE_ROOM = "on-update-room",
	ON_BLOCK_USER = "on-block-user",
	ON_MUTE_USER = "on-mute-user",
	ON_ADD_MEMBER_TO_CHAT = "on-add-member-to-chat",
	ON_CHANGE_ROLE = "on-change-role",
	ON_UNREAD_MSG = "on-unread-msg",
	ON_READ_MSG = "on-read-msg",
	ON_GET_UNREAD_MSG = "on-get-unread-msg"
}
export enum eChatType{
	DIRECT = 'direct',
	PRIVATE = 'private',
	PUBLIC = 'public'
}