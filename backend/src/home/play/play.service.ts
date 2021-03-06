import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SessionService } from "src/session/session.service";
import { mDate } from "src/shared/utils/date";
import { SocketService } from "src/socket/socket.service";
import { Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { User } from "../user/userClass";
import { UserPublicInfoI } from "../user/userI";
import { eRequestPlayer } from "./ePlay";
import { GameI, PlayerI, SystemInfoI, WaitRoomI } from "./iPlay";
import { PlayEntity } from "./play.entity";
import { Response } from "src/shared/response/responseClass";
import { StatsEntity } from "./stats.entity";

@Injectable()
export class PlayService {
	constructor(@InjectRepository(UserEntity)
                private userRepository: Repository<UserEntity>,
				@InjectRepository(StatsEntity)
                private statsRepository: Repository<StatsEntity>,
                @InjectRepository(PlayEntity)
                private playRepository: Repository<PlayEntity>,
                @Inject(forwardRef(() => UserService)) // forwardRef solves circular dependencies: 
				private userService: UserService,
				private socketService: SocketService,
				private sessionService: SessionService){}


	async getSession(client: any): Promise<any> {
		try {
			const token = client.handshake.headers.authorization.split(" ")[1];
			const session = await this.sessionService.findSessionWithRelation(token);
			return session;
		} catch (error) {}
	}
  
	async getSessionUser(client: any): Promise<any> {
		try {
		const session = await this.getSession(client);
		return session.userID;
		} catch (error) {}
	}
    
    async newInviation(me: UserEntity, oponent: UserPublicInfoI): Promise<UserEntity>{
        try {
        	const opUsr = await this.userService.findByLogin(oponent.login);
        	/*Checks if invitation exists */
        	const invitation = await this.playRepository.findOne({where: [
            	{player_1: me.id, player_2: opUsr.id},
            	{player_2: me.id, player_1: opUsr.id}
        	]});
			if (invitation !== undefined)
				return (null);
			await this.playRepository.insert({player_1: me, player_2: opUsr});
			return (opUsr);
        } catch(e) {
            return (null);
        }
    }
  
	async getAllGameInvitations(user: UserEntity): Promise<UserPublicInfoI[]>
	{
		var userProfiles: UserPublicInfoI[] = [];
		const invitations = await this.playRepository.find({
			relations: ["player_1", "player_2", "viewers"],
			where: {player_2: user.id, confirmed: false}
		});
		for (let i = 0; i < invitations.length; i++) {
			const element = invitations[i].player_1;
			userProfiles.push(User.getPublicInfo(element))
		}
		return (userProfiles);
	}

	async acceptGameInvitation(me: UserEntity, user: UserPublicInfoI): Promise<PlayEntity>{
		const usrEntity = await this.userService.findByLogin(user.login);
		const invitation = await this.playRepository.findOne({
			relations: ["player_1", "player_2", "viewers"],
			where: {player_1: usrEntity.id, player_2: me.id}
		});
		invitation.confirmed = true;
		invitation.p2_status = eRequestPlayer.ACCEPTED;
		invitation.expiration_time = mDate.setExpirationTime(Number(process.env.WAIT_ROOM_EXPIRES));
		const tmp = await this.playRepository.find({
			where: [
				{player_1: invitation.player_1.id, confirmed: true},
           		{player_2: invitation.player_1.id, confirmed: true},
				{player_2: invitation.player_2.id, confirmed: true},
				{player_1: invitation.player_2.id, confirmed: true}
			]
		});
		if (tmp.length > 0)
			return (null);
		await this.playRepository.save(invitation);
		return (invitation);
	}

	async declineGameInvitation(me: UserEntity, user: UserPublicInfoI): Promise<void>{
		const usrEntity = await this.userService.findByLogin(user.login);
		const invitation = await this.playRepository.findOne({
			where: {player_1: usrEntity.id, player_2: me.id}
		});
		if (invitation !== undefined)
			await this.playRepository.delete(invitation);
	}

	async removePlayRoom(waitRoom: WaitRoomI): Promise<void>
	{
		const playRoom = await this.playRepository.findOne({
			relations: ["player_1", "player_2"],
			where: {id: waitRoom.id}
		});
		if (playRoom !== undefined)
		{
			playRoom.player_1.in_game = false;
			playRoom.player_2.in_game = false;
			await this.userService.changeInGameStatus(playRoom.player_1);
			await this.userService.changeInGameStatus(playRoom.player_2);
			await this.playRepository.delete(playRoom);
		}
	}

	async acceptWaitRoom(me: UserEntity, waitRoom: WaitRoomI): Promise<PlayEntity>
	{
		const invitation = await this.playRepository.findOne({
			relations: ["player_1", "player_2", "viewers"],
			where: { id: waitRoom.id }
		});
		if (invitation.player_1.login == me.login)
			invitation.p1_status = eRequestPlayer.ACCEPTED;
		else
			invitation.p2_status = eRequestPlayer.ACCEPTED;
		if (invitation.p1_status == eRequestPlayer.ACCEPTED && invitation.p2_status == eRequestPlayer.ACCEPTED)
			invitation.selecting = invitation.player_1.nickname;
		await this.playRepository.save(invitation);
		return(invitation);
	}

	async getActivePlayRoom(me: UserEntity): Promise<PlayEntity>
	{
		const playRoom = await this.playRepository.findOne({
			relations: ["player_1", "player_2", "viewers"],
			where: [
				{player_1: me.id, confirmed: true},
				{player_2: me.id, confirmed: true}
			]
		});
		return (playRoom);
	}

	async onGetLiveGames(): Promise<WaitRoomI[]>
	{
		try {
			var array: WaitRoomI[] = [];
			
			const games = await this.playRepository.find({ 
				relations: ["player_1", "player_2", "viewers"],
				where: { ready: true } 
			});
			if (games.length == 0)
				return (array);
			for (let i = 0; i < games.length; i++)
				array.push(this.createWaitRoom(games[i]));
			return (array);					
		}
		catch (e) {
			return (array);
		}
	}

	async addViewer(viewer: UserEntity, gameRoom: WaitRoomI): Promise<PlayEntity>
	{
		const game = await this.playRepository.findOne({
			relations: ["player_1", "player_2", "viewers"],
			where: {id: gameRoom.id}
		})
		if (game == undefined)
			return (game);
		game.viewers.push(viewer);
		await this.playRepository.save(game);
		return (game);
	}

	async removeViewer(viewer: UserPublicInfoI, gameRoom: WaitRoomI): Promise<PlayEntity>
	{
		var game = await this.playRepository.findOne({
			relations: ["player_1", "player_2", "viewers"],
			where: {id: gameRoom.id}
		});
		if (game == undefined)
			return (game);
		game.viewers = game.viewers.filter(item => item.login != viewer.login);
		await this.playRepository.save(game);
		return (game);
	}

	async getGame(token: string, user: UserPublicInfoI): Promise<any>
	{
		try {
			const session = await this.sessionService.findSessionWithRelation(token);
			if (session == undefined)
				return (Response.makeResponse(401, {error : "Unauthorized"}));
			const usrEntity = await this.userService.findByLogin(user.login);
			const game = await this.playRepository.findOne({
				relations: ["player_1", "player_2", "viewers"],
				where: [
					{player_1 : usrEntity.id, ready: true},
					{player_2 : usrEntity.id, ready: true},
				]
			});
			return (Response.makeResponse(200, this.createWaitRoom(game)));
		}
		catch (error) {
			console.log(error);
			return (Response.makeResponse(500, {error: "Internal server error"}));
		}
	}

	async findGameById(id: number): Promise<PlayEntity|undefined>
	{
		try {
			const game = await this.playRepository.findOne({
				relations: ["player_1", "player_2", "viewers"],
				where: {id: id}
			});
			return (game);
		}
		catch (error) {
			return (undefined)
		}
	}

	async endGame(obj: GameI, game: WaitRoomI): Promise<void>
	{
		var stats = <StatsEntity>{};
		stats.player_1 = game.player1.nickname;
		stats.player_2 = game.player2.nickname;
		stats.score_p1 = obj.score_p1;
		stats.score_p2 = obj.score_p2;
		stats.hits_p1 = obj.hits_p1;
		stats.hits_p2 = obj.hits_p2;
		
		try {
			const player1 = await this.userService.findByLogin(game.player1.login);
			const player2 = await this.userService.findByLogin(game.player2.login);
			player1.hits += obj.hits_p1;
			player2.hits += obj.hits_p2;

			if (obj.score_p1 > obj.score_p2)
			{
				player1.victories++;
				player2.defeats++;
			}
			else if (obj.score_p1 < obj.score_p2)
			{
				player1.defeats++;
				player2.victories++;
			}
			await this.userService.save(player1);
			await this.userService.save(player2);
			await this.statsRepository.save(stats);
		}
		catch (error) {
			console.log(error);
		}
	}

	async getPlayer(player: PlayerI): Promise<UserEntity>
	{
		return (await this.userService.findByLogin(player.login));
	}

	public createWaitRoom(invitation: PlayEntity): WaitRoomI
	{
		return ({
			id: invitation.id,
			player1: this.createPlayer(invitation.player_1, invitation.p1_status),
			player2: this.createPlayer(invitation.player_2, invitation.p2_status),
			expires: invitation.expiration_time,
			ready: invitation.ready,
			viewers: invitation.viewers,
			selecting: invitation.selecting,
			play_modes: invitation.play_modes
		});
	}

	public	createPlayer(user: UserEntity, status: string): PlayerI
	{
		return ({
			id : user.id,
			nickname : user.nickname,
			login: user.login,
			avatar : user.avatar,
			status : status
		});
	}

	/** Get live games for controler. Can be deleted */
	async getLiveGames(header: string): Promise<any>
	{
		const token = header.split(' ')[1];
		try {
			var array: WaitRoomI[] = [];
			const session = await this.sessionService.findSessionWithRelation(token);
			if (session == undefined)
				return (Response.makeResponse(401, { error: "unauthorized" }));
			//get games
			const games = await this.playRepository.find({ 
				relations: ["player_1", "player_2", "viewers"],
				where: { ready: true } 
			});
			if (games.length == 0)
				return (Response.makeResponse(200, array ));
			for (let i = 0; i < games.length; i++)
				array.push(this.createWaitRoom(games[i]));
			return (Response.makeResponse(200, array ));					
		}
		catch (e) {
			return (Response.makeResponse(500, { error: "internal server error" }));
		}
	}

	async matchMaking(p1: UserEntity, p2: UserEntity): Promise<WaitRoomI> {
		try {
			var game: PlayEntity =<PlayEntity>{};
			game.player_1 = p1;
			game.player_2 = p2;
			game.confirmed = true;
			game.expiration_time = mDate.setExpirationTime(Number(process.env.WAIT_ROOM_EXPIRES));
			var aux = await this.playRepository.save(game);
			var playRoom: PlayEntity = await this.findGameById(aux.id);
			
			return (this.createWaitRoom(playRoom));
		} catch (error) {
			return (null);
		}
	}

	async diselectPlayMode(data: any, me: UserEntity): Promise<PlayEntity>
	{
		try {
			const room = await this.findGameById(data.id);
			if (room.player_1.nickname == me.nickname)
				room.selecting = room.player_2.nickname;
			else
				room.selecting = room.player_1.nickname;
			room.play_modes = room.play_modes.filter(item => item != data.mode);
			if (room.play_modes.length == 1)
			{
				room.ready = true;
				room.player_1.in_game = true;
				room.player_2.in_game = true;
				await this.userRepository.save(room.player_1);
				await this.userRepository.save(room.player_2);
			}
			await this.playRepository.save(room);

			return (room)
		} catch (error) {}
	}

	async getRanking(): Promise<UserPublicInfoI[]> {
		try {
			var ranking = await this.userService.findPosition();
			//only first 10 players
			ranking = ranking.slice(0, 10);
			//transform into UserPublicInfoI array
			var users: UserPublicInfoI [] = [];
			for (var i = 0; i < ranking.length; i++) {
				if (ranking[i].login != "nobody")
			  		users.push(await User.getPublicInfo(ranking[i]));
			}
			return (users);
		} catch (error) { }
	}
	async getInfoSystem(): Promise<any> {
		try {
			var data: SystemInfoI = <SystemInfoI>{}
			data.in_game_users = 0;
			data.online_users = 0;
			data.total_users = 0;
			var result = await this.userRepository.find();
			result = result.filter(item => item.login != "nobody");
			data.total_users = result.length;
			for (var i = 0; i < result.length; i++){
				if (result[i].online)
					data.online_users++;
				if (result[i].in_game)
					data.in_game_users++;
			}
			return (data);
		} catch (error) { }
	}
}