import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Session } from "inspector";
import { SessionEntity } from "src/session/session.entity";
import { SessionService } from "src/session/session.service";
import { mDate } from "src/shared/utils/date";
import { SocketService } from "src/socket/socket.service";
import { In, Like, Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { User } from "../user/userClass";
import { UserPublicInfoI } from "../user/userI";
import { ePlay, eRequestPlayer } from "./ePlay";
import { PlayerI, WaitRoomI } from "./iPlay";
import { PlayEntity } from "./play.entity";
import { Response } from "src/shared/response/responseClass";

@Injectable()
export class PlayService {
    constructor(@InjectRepository(UserEntity)
                private userRepository: Repository<UserEntity>,
                @InjectRepository(PlayEntity)
                private playRepository: Repository<PlayEntity>,
                @Inject(forwardRef(() => UserService)) // forwardRef solves circular dependencies: 
				private userService: UserService,
				private socketService: SocketService,
				private sessionService: SessionService){}
    
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
        } catch(e){
            console.log(e);
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
		})
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
		})
		if (tmp.length > 0)
			return (null);
		await this.playRepository.save(invitation);
		return (invitation);
	}
	async declineGameInvitation(me: UserEntity, user: UserPublicInfoI){
		const usrEntity = await this.userService.findByLogin(user.login);
		const invitation = await this.playRepository.findOne({
			where: {player_1: usrEntity.id, player_2: me.id}
		})
		if (invitation !== undefined)
			await this.playRepository.delete(invitation);
	}

	async removePlayRoom(waitRoom: WaitRoomI)
	{
		const playRoom = await this.playRepository.findOne({
			relations: ["player_1", "player_2"],
			where: {id: waitRoom.id}
		})
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
		console.log("accepting");
		const invitation = await this.playRepository.findOne({
			relations: ["player_1", "player_2", "viewers"],
			where: {id: waitRoom.id}
		})
		if (invitation.player_1.login == me.login)
			invitation.p1_status = eRequestPlayer.ACCEPTED;
		else
			invitation.p2_status = eRequestPlayer.ACCEPTED;
		if (invitation.p1_status == eRequestPlayer.ACCEPTED && invitation.p2_status == eRequestPlayer.ACCEPTED)
			invitation.ready = true;
		invitation.player_1.in_game = true;
		invitation.player_2.in_game = true;
		await this.userService.changeInGameStatus(invitation.player_1);
		await this.userService.changeInGameStatus(invitation.player_2);
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
		})
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
		})
		if (game == undefined)
			return (game);
		game.viewers = game.viewers.filter(item => item.login != viewer.login);
		await this.playRepository.save(game);
		return (game);
	}
	async getGame(token: string, user: UserPublicInfoI)
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
			})
			return (Response.makeResponse(200, this.createWaitRoom(game)));
		}
		catch (error) {
			console.log(error);
			return (Response.makeResponse(500, {error: "Internal server error"}));
		}
	}

	async findGameById(id: number)
	{
		try {
			const game = await this.playRepository.findOne({
				relations: ["player_1", "player_2", "viewers"],
				where: {id: id}
			})
			return (game);
		}
		catch (error) {
			return (undefined)
		}
	}

	async addVictory(winner: string)
	{
		try {
			//find user with login
			const user = await this.userService.findByLogin(winner);
			if (user == undefined)
				return (Response.makeResponse(500, {error: "Internal server error"}));
			//add victory
			user.victories++;
			await this.userService.save(user);
			return (Response.makeResponse(200, {message: "Victory added"}));
		}
		catch (error) {
			return (Response.makeResponse(500, {error: "Internal server error"}));
		}
	}

	async addDefeat(loser: string)
	{
		try {
			//find user with login
			const user = await this.userService.findByLogin(loser);
			if (user == undefined)
				return (Response.makeResponse(500, {error: "Internal server error"}));
			//add defeat
			user.defeats++;
			await this.userService.save(user);
			return (Response.makeResponse(200, {message: "Defeat added"}));
		}
		catch (error) {
			return (Response.makeResponse(500, {error: "Internal server error"}));
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
			viewers: invitation.viewers
		})
	}

	public	createPlayer(user: UserEntity, status: string): PlayerI
	{
		return ({
			id : user.id,
			nickname : user.nickname,
			login: user.login,
			avatar : user.avatar,
			status : status
		})
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
	/*
    play = find(by id with relations[ player_1, player_2, viewers]);
    for (...)
        this.socketService.emitToOne(this.server, ePlay.ON_STREAM, me.login, play.viewers[i], data);
	*/
}