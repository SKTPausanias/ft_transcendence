import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/home/user/user.entity';
import { Like, Repository } from 'typeorm';
import { Response } from '../../shared/response/responseClass';
import { ErrorParser } from '../../shared/utils/errorParser';
import { Exception } from '../../shared/utils/exception';
import { User } from './userClass';
import { SessionService } from 'src/session/session.service';
import { FriendService } from '../friends/friend.service';
import { FriendEntity } from '../friends/friend.entity';
import { ActiveRoomEntity } from '../chat/entities/activeRoom.entity';
import { ChatUsersEntity } from '../chat/entities/chatUsers.entity';
import { UnreadMessageEntity } from '../chat/entities/unread-message.entity';
import { MessageEntity } from '../chat/entities/message.entity';
import { ChatService } from "../chat/chat.service"
import { ChatRoomI } from "../chat/iChat";
import { ChatEntity } from '../chat/entities/chat.entity';

@Injectable()
export class UserService {

	constructor(
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		@InjectRepository(FriendEntity)
		private friendRepository: Repository<FriendEntity>,
		/* @InjectRepository(SessionEntity)
		private sessionRepository: Repository<SessionEntity>, */
		@InjectRepository(ActiveRoomEntity)
		private activeRoomRepository: Repository<ActiveRoomEntity>,
		@InjectRepository(ChatEntity)
		private chatRepository: Repository<ChatEntity>,
		@InjectRepository(ChatUsersEntity)
		private chatUserRepository: Repository<ChatUsersEntity>,
		@InjectRepository(UnreadMessageEntity)
		private unreadMessagesRepository: Repository<UnreadMessageEntity>,
		@InjectRepository(MessageEntity) private messagesRepository: Repository<MessageEntity>,
		private friendService: FriendService,
		private sessionService: SessionService,
		//A circular dependency occurs when two classes depend on each other. For example, class A needs class B, and class B also needs class A. 
		@Inject(forwardRef(() => ChatService)) // forwardRef solves circular dependencies: 
		private chatService: ChatService
		){}

	async findById(id: number): Promise<UserEntity | undefined> {
		try {
			return await this.userRepository.findOne({ where: { id } });
		} catch (error) {
			throw new Exception(Response.makeResponse(404, {error : "User not found"}))
		}
	}async findByLogin(login: string): Promise<UserEntity | undefined> {
		try {
			return await this.userRepository.findOne({ where: { login } });
		} catch (error) {
			throw new Exception(Response.makeResponse(404, {error : "User not found"}))
		}
	}
	async findByNickname(nickname: string): Promise<UserEntity | undefined> {
		try {
			return await this.userRepository.findOne({ where: { nickname } });
		} catch (error) {
			throw new Exception(Response.makeResponse(404, {error : "User not found"}))
		}
	}
	async findByEmail(email: string): Promise<UserEntity | undefined> {
		try{
			return await this.userRepository.findOne({ where: { email } });
		} catch (error) {
			throw new Exception(Response.makeResponse(500, {error : "User not found"}))
		}
	}

	async save(user: any): Promise<UserEntity | any>{
		try {
			return (await this.userRepository.save(user));
		} catch (error) {
			throw new Exception(Response.makeResponse(500, {error : ErrorParser.parseDbSaveExeption(error)}))
		}
	}
	async update(usrEntity: UserEntity, usr: any): Promise<UserEntity | any>{
		try {
			return (await this.userRepository.update(usrEntity, usr));
		} catch (error) {
			throw new Exception(Response.makeResponse(500, {error : ErrorParser.parseDbSaveExeption(error)}))
		}
	}
	private setChatRoom(user: UserEntity, chatUsers: ChatUsersEntity, chat: ChatEntity): ChatRoomI {
		var chatRoom: ChatRoomI = <ChatRoomI>{};
		console.log("Found obj: ", chatUsers);
		chatRoom.id = chat.id;
		chatRoom.name = chat.name;
		chatRoom.me = user; //UserPublicInfoI;
		chatRoom.imBanned = chatUsers.banned; //false;
		chatRoom.imMuted = chatUsers.muted; // false;
		chatRoom.owner = chatUsers.owner; //: boolean;
		chatRoom.admin = chatUsers.admin //: boolean;
		
		
		/*banned: UserPublicInfoI[];
		chatRoom.members = chat.members; // UserPublicInfoI[];
		img: string | undefined;
		ownerInfo: UserPublicInfoI;
		muted: UserPublicInfoI[];
		admins: UserPublicInfoI[];
		onlineStatus: boolean;
		type: string;
		protected: boolean;
		hasRoomKey: boolean;
		unreadMsg: number; */
		return (chatRoom)
	}
	async deleteUser(usr: any): Promise<any>
	{
		/* Remove: friendships, activeChats, chatUsers, sessions, ureadMessages, (Only for direct [Messages, chats...]) and finally user
		 * do we want to keep messages for other users who have direct messages with this user?
		 */
		try {
			/* This user will be used to reasign all messages to itself */
			var nobody: UserEntity = await this.findByLogin("nobody");
			console.log("Looking for friendships...");
			var user: UserEntity = await this.findByLogin(usr.login);
			
			/**Looking for friendship to lacate the chats directs if they exists */
			console.log("User found...");
			const friendships = await this.friendRepository.find({
				relations: ['user_1', 'user_2'],
				where: [{user_1: user.id}, {user_2 : user.id} ]
			});
			/**If the friendship is present, it will be removed */
			await this.friendRepository.remove(friendships);
			console.log("Friendship was removed...");
			
			/* const session = await this.sessionRepository.find({relations: ["userID"], where: {userID: user}});
			await this.sessionRepository.remove(session);
			console.log("Sessions were removed...");
 			*/
			/**Looking for actives rooms of the user, including the ones that are direct or private */
			const activeRoom = await this.activeRoomRepository.find({relations: ["user"], where: {user: user}});
			console.log("Active rooms were found...");
			/**Then they'll be removed */
			await this.activeRoomRepository.remove(activeRoom);
			console.log("Active rooms were removed...");

			/**Locate unread messages on the proper table, next, in an iteration they will be removed */
			const chatUsers = await this.chatUserRepository.find({relations: ["user", "unreadMessages"], where: {user: user}});
			for (var i = 0; i < chatUsers.length; i++)
				await this.unreadMessagesRepository.remove(chatUsers[i].unreadMessages);
			console.log("Unread messages were removed...");

			/**This step will found all messages belonging to the user accaout that will be deleted */
			const messages = await this.messagesRepository.find({relations: ["owner", "chat", "chat.members" /*, "chat.members.user"*/], where: { owner: user }});
			
			/**Next, in the iteration the messages will be reasigned to nobody user and updated the corresponding table */
			for (var i = 0; i < messages.length; i++) { //keep if it works, all messages from group and private********************
				if (messages[i].chat.type == "direct")
					await this.messagesRepository.remove(messages[i])
				await this.messagesRepository.update(messages[i], {owner: nobody});
			}

			/**After reasigning the messages (Maybe before... I'll check those cases to see what is the best solution) */
			//select * FROM chat_users, chat where chat_users."userId" = 6 AND chat_users."roomId" = chat."id" AND chat.type != 'direct';
			const rooms = await this.chatUserRepository.find({relations: ["user", "room"], where: {user: user}});
			//console.log("Rooms found where: ", rooms);
			//Must get all non-Direct chats to leave these chats
			//after that we can delete those chats which are directs or change all references to noboy
			for (var i = 0; i < rooms.length; i++) {
				if (rooms[i].room.type != "direct") {
					console.log("Setting on channel: ", i);
					this.chatService.leaveRoom(this.setChatRoom(user, rooms[i], rooms[i].room));
				} else if (rooms[i].room.type == "direct") {
					console.log("Room direct find the chatUserID to delete: ", rooms[i].room.id)
					const toDelete = await this.chatUserRepository.find({relations: ["room"], where: {"room.id": rooms[i].room.id}})
					this.chatUserRepository.remove(toDelete);
					this.chatRepository.remove(rooms[i].room);
					//this.chatUserRepository.remove(rooms[i]);*****************
				}
			}

			//delete direct chats:
			/** (NEXT TIME WE CODE DATABASE TABLES SCHEMES WE MUST GIVE STANDARD NAMES FOR FIELDS AND RELATIONS FIELDS :( )*/
			//return ({});
			return (await this.userRepository.remove(usr)); // Must emit all changes to all users implicated
		} catch (error) {
			throw new Exception(Response.makeResponse(500, {error : "Can't delete user"}))
		}
	}

	async findMatchByLoginNickname(match: string, user: UserEntity)
    {
        try {
            const resp =  await this.userRepository.find({where: [
                            { nickname : Like(`%${match}%`)},
                            { login : Like(`%${match}%`)}]});
            return (User.getMultipleUserInfo(resp, user));
        }
        catch (error) {
            throw new Exception(Response.makeResponse(500, {error : "Can't find match"}));
        }
    }

	async getUserInfo(header: any) //body
	{
		const token = header.authorization.split(' ')[1];
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			return (Response.makeResponse(200, User.getInfo(session.userID)));
		} catch (error) {
			return (Response.makeResponse(401, {error : "Unauthorized"}));
		}
	}
	async getOnlineUsers(header: any){
		const token = header.authorization.split(' ')[1];
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			const sessions = await this.sessionService.findAllExcept(session);
			return (Response.makeResponse(200, User.getOnlineUserInfo(sessions)))
		} catch (error) {
			return (Response.makeResponse(401, {error : "Unauthorized"}));
		}
	}

	//get all online friends of the user
	async getFriends(header: any): Promise<any> {
		try {
			const token = header.authorization.split(' ')[1];
			const session = await this.sessionService.findSessionWithRelation(token);
			const friends = await this.friendService.findAllFriends(session.userID);
			return (Response.makeResponse(200, friends));
		} catch (error) {
			return (error);
		}
	}
	/* async activateRoom(users: UserEntity[], roomId: number){
		users.forEach(async user => {
			if (user.active_chat_rooms)
			{
				if (user.active_chat_rooms.find(room => room == roomId) === undefined)
					user.active_chat_rooms.push(roomId);
			}
			else
				user.active_chat_rooms = [roomId];
			await this.save(user);
		});
	}
	async desactivateRoom(users: UserEntity[], roomId: number){
		users.forEach(async user => {
			user.active_chat_rooms = user.active_chat_rooms.filter(id => id != roomId);
			console.log("llega3");
			await this.save(user);
			console.log("llega4");
		});
	} */
}
