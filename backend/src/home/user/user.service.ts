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
import { UserPublicInfoI } from './userI';
import { TwoFactorEntity } from 'src/auth/two-factor/two-factor.entity';

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
		@InjectRepository(TwoFactorEntity) private twoFactorRepository: Repository<TwoFactorEntity>,
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

	async findPosition(): Promise<UserEntity[]>{
		return await this.userRepository.find({
			order: {
				victories: "DESC",
				defeats: "ASC",
				hits: "DESC"
			}
		});
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
		chatRoom.id = chat.id;
		chatRoom.name = chat.name;
		chatRoom.me = user; //UserPublicInfoI;
		chatRoom.imBanned = chatUsers.banned; //false;
		chatRoom.imMuted = chatUsers.muted; // false;
		chatRoom.owner = chatUsers.owner; //: boolean;
		chatRoom.admin = chatUsers.admin //: boolean;
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
			var user: UserEntity = await this.findByLogin(usr.login);
			
			/**Looking for friendship to lacate the chats directs if they exists */
			const friendships = await this.friendRepository.find({
				relations: ['user_1', 'user_2'],
				where: [{user_1: user.id}, {user_2 : user.id} ]
			});
			/**If the friendship is present, it will be removed */
			await this.friendRepository.remove(friendships);
			
			/* const session = await this.sessionRepository.find({relations: ["userID"], where: {userID: user}});
			await this.sessionRepository.remove(session);
			
 			*/
			/**Looking for actives rooms of the user, including the ones that are direct or private */
			const activeRoom = await this.activeRoomRepository.find({relations: ["user"], where: {user: user}});
			
			/**Then they'll be removed */
			await this.activeRoomRepository.remove(activeRoom);
			

			/**Locate unread messages on the proper table, next, in an iteration they will be removed */
			const chatUsers = await this.chatUserRepository.find({relations: ["user", "unreadMessages"], where: {user: user}});
			for (var i = 0; i < chatUsers.length; i++)
				await this.unreadMessagesRepository.remove(chatUsers[i].unreadMessages);
			

			/**This step will found all messages belonging to the user accaout that will be deleted */
			const messages = await this.messagesRepository.find({relations: ["owner", "chat", "chat.members" /*, "chat.members.user"*/], where: { owner: user }});
			
			/**Next, in the iteration the messages will be reasigned to nobody user and updated the corresponding table */
			for (var i = 0; i < messages.length; i++) { //keep if it works, all messages from group and private********************
				if (messages[i].chat.type == "direct")
					await this.messagesRepository.remove(messages[i])
				else
					await this.messagesRepository.update(messages[i], {owner: nobody});
			}

			/**After reasigning the messages (Maybe before... I'll check those cases to see what is the best solution) */
			//select * FROM chat_users, chat where chat_users."userId" = 6 AND chat_users."roomId" = chat."id" AND chat.type != 'direct';
			const rooms = await this.chatUserRepository.find({relations: ["user", "room"], where: {user: user}});
			
			//Must get all non-Direct chats to leave these chats
			//after that we can delete those chats which are directs or change all references to noboy
			for (var i = 0; i < rooms.length; i++) {
				if (rooms[i].room.type != "direct") {
					
					this.chatService.leaveRoom(this.setChatRoom(user, rooms[i], rooms[i].room));
				} else if (rooms[i].room.type == "direct") {
					
					const toDelete = await this.chatUserRepository.find({relations: ["room"], where: {"room.id": rooms[i].room.id}})
					this.chatUserRepository.remove(toDelete);
					this.chatRepository.remove(rooms[i].room);
					//this.chatUserRepository.remove(rooms[i]);*****************
				}
			}

			//Deleting from session
			await this.sessionService.deleteFromSession(usr);
			//Deleting from twoFactor
			const factorDelete = await this.twoFactorRepository.find({relations: ['userID'], where: {"userID.id": usr.id}});
			if (factorDelete !== undefined){
				console.log("Deleting from twoFactor");
				await this.twoFactorRepository.remove(factorDelete);
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
	async getUserPublicInfo(token: string, user: UserPublicInfoI) //body
	{
		
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			if (session == undefined)
				return (Response.makeResponse(401, {error : "Unauthorized"}));
			const usr = await this.findByLogin(user.login);
			return (Response.makeResponse(200, User.getPublicInfo(usr)));
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

	async changeInGameStatus(user: UserEntity)
	{
		await this.userRepository.save(user);
	}

	async getUserPosition(token: string, user: UserPublicInfoI){
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			if (session == undefined)
				return (Response.makeResponse(401, {error : "Unauthorized"}));
				
			var usr = await this.findPosition();
			usr = usr.filter(item => item.login != "nobody");
			for (var i = 0; i < usr.length; i++){
				if (usr[i].login == user.login)
				return (Response.makeResponse(200, {position: (i + 1)}));//set position
			}
			return (Response.makeResponse(200, {position: i + 1}));//set position
		} catch (error) {
			return (Response.makeResponse(401, {error : "Unauthorized"}));
		}
	}
	async insertNoBody(): Promise<void> {

		var name: string = "nobody"
		var usr:UserEntity =  <UserEntity>{};
		
		try {
			usr.id = 1000000;
			usr.login = name;
			usr.nickname = name;
			usr.first_name = name;
			usr.last_name = name;
			usr.email = "nobody@nobody.local";
			usr.password = "123456qwerty123456qwerty";
			usr.role = "fool";
			usr.avatar = "http://localhost:3000/img/default_avatar.png";
			usr.factor_enabled = true;
			usr.confirmed = true;
			usr.online = false;
			usr.victories = 0;
			usr.defeats = 0;
			usr.in_game = false;
			usr.hits = 0;
		
			await this.userRepository.save(usr);
			console.log("User nobody created from userService");
		} catch (e){}
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
			
			await this.save(user);
			
		});
	} */
}
