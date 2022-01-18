import { WebSocketGateway, SubscribeMessage } from '@nestjs/websockets';
import { SessionService } from 'src/session/session.service';
import { mDate } from 'src/shared/utils/date';
import { SocketService } from 'src/socket/socket.service';
import { UserEntity } from '../user/user.entity';
import { User } from '../user/userClass';
import { UserPublicInfoI } from '../user/userI';
import { ePlay, eRequestPlayer } from './ePlay';
import { PlayerI, WaitRoomI } from './iPlay';
import { PlayEntity } from './play.entity';
import { PlayService } from './play.service';
import { UserService } from '../user/user.service';
import { wSocket } from 'src/socket/eSocket';


@WebSocketGateway({ cors: true })
export class PlayGateway {
	server: any;
	timeLap: number = 120;
	constructor(private socketService: SocketService,
                private playService: PlayService,
				private sessionService: SessionService,
				private userService: UserService){}

	init(server: any){
		this.server = server;
	}

	@SubscribeMessage(ePlay.ON_LOAD_ALL_GAME_INVITATIONS)
	async onLoadAllGameInvitations(client, data) {
		const me = await this.getSessionUser(client);
		const invitations = await this.playService.getAllGameInvitations(me);
		this.server.to(client.id).emit(ePlay.ON_LOAD_ALL_GAME_INVITATIONS, me.login, invitations);
	}
	@SubscribeMessage(ePlay.ON_LOAD_ACTIVE_WAIT_ROOM)
	async onLoadActiveWaitRoom(client, data) {
		
		const me = await this.getSessionUser(client);
		const playRoom = await this.playService.getActivePlayRoom(me);
		var waitRoom;
		if (playRoom !== undefined)
			this.server.to(client.id).emit(ePlay.ON_LOAD_ACTIVE_WAIT_ROOM, this.playService.createWaitRoom(playRoom));
	}

	@SubscribeMessage(ePlay.ON_REQUEST_INVITATION)
	async onRequestInvitation(client, data) {
		
		const me = await this.getSessionUser(client);
		const opUser = await this.playService.newInviation(me, data);
		if (opUser != null)
			this.socketService.emitToOne(this.server, ePlay.ON_REQUEST_INVITATION, me.login, opUser, User.getPublicInfo(me));
		
	}

	@SubscribeMessage(ePlay.ON_ACCEPT_INVITATION)
	async onAcceptInvitation(client, data) {
		var waitRoom: WaitRoomI = <WaitRoomI>{};
		const me = await this.getSessionUser(client);
		const invitation = await this.playService.acceptGameInvitation(me, data);
		if (invitation == null)
			return ;
		waitRoom = this.playService.createWaitRoom(invitation);
		this.socketService.emitToOne(this.server, ePlay.ON_ACCEPT_INVITATION, me.login, invitation.player_1, waitRoom);
		this.socketService.emitToOne(this.server, ePlay.ON_ACCEPT_INVITATION, me.login, invitation.player_2, waitRoom);
	}

	@SubscribeMessage(ePlay.ON_DECLINE_INVITATION)
	async onDeclineInvitation(client, data) {
		const me = await this.getSessionUser(client);
		await this.playService.declineGameInvitation(me, data);
		this.server.to(client.id).emit(ePlay.ON_DECLINE_INVITATION, data);
	}

	@SubscribeMessage(ePlay.ON_WAIT_ROOM_ACCEPT)
	async onWaitRoomAccept(client, data) {
		
		const me = await this.getSessionUser(client);
		const invitation = await this.playService.acceptWaitRoom(me, data);
		const waitRoom = this.playService.createWaitRoom(invitation);
		this.socketService.emitToOne(this.server, ePlay.ON_WAIT_ROOM_ACCEPT, me.login, invitation.player_1, waitRoom);
		this.socketService.emitToOne(this.server, ePlay.ON_WAIT_ROOM_ACCEPT, me.login, invitation.player_2, waitRoom);
		this.server.emit(ePlay.ON_GET_LIVE_GAMES, me.login, await this.playService.onGetLiveGames());
	}

	@SubscribeMessage(ePlay.ON_WAIT_ROOM_REJECT)
	async onWaitRoomReject(client, data: WaitRoomI) {
		await this.playService.removePlayRoom(data);
		const me = await this.getSessionUser(client);
		var oponent;
		if (me.login == data.player1.login)
		 	oponent = await this.playService.getPlayer(data.player2);
		else
			oponent = await this.playService.getPlayer(data.player1);
		data.ready = false;
		this.socketService.emitToOne(this.server, ePlay.ON_WAIT_ROOM_REJECT, me.login, oponent, data);
		this.socketService.emitToOne(this.server, ePlay.ON_WAIT_ROOM_REJECT, me.login, me, data);
	}
	@SubscribeMessage(ePlay.ON_GET_LIVE_GAMES)
	async onGetLiveGames(client) {
		const me = await this.getSessionUser(client);
		const games = await this.playService.onGetLiveGames();
		this.socketService.emitToOne(this.server, ePlay.ON_GET_LIVE_GAMES, me.login, me, games);
	}
	@SubscribeMessage(ePlay.ON_START_STREAM)
	async onStartStream(client, data: WaitRoomI) {
		const me = await this.getSessionUser(client);
		const game = await this.playService.addViewer(me, data);
		if (game == undefined)
			return ;
		var gameI = this.playService.createWaitRoom(game);
		// ON_WAIT_ROOM_ACCEPT has to be changed to ON_ROOM_UPDATE
		this.socketService.emitToOne(this.server, ePlay.ON_WAIT_ROOM_ACCEPT, me.login, game.player_1, gameI);
		this.socketService.emitToOne(this.server, ePlay.ON_WAIT_ROOM_ACCEPT, me.login, game.player_2, gameI);
		
	}

	@SubscribeMessage(ePlay.ON_STOP_STREAM)
	async onStopStream(client, data: WaitRoomI) {
		const me = await this.getSessionUser(client);
		const game = await this.playService.removeViewer(me, data);
		if (game == undefined)
			return ;
		var gameI = this.playService.createWaitRoom(game);
		// ON_WAIT_ROOM_ACCEPT has to be changed to ON_ROOM_UPDATE
		this.socketService.emitToOne(this.server, ePlay.ON_WAIT_ROOM_ACCEPT, me.login, game.player_1, gameI);
		this.socketService.emitToOne(this.server, ePlay.ON_WAIT_ROOM_ACCEPT, me.login, game.player_2, gameI);
		
	}

	@SubscribeMessage(ePlay.ON_GAME_END)
	async onGameEnd(client, data: WaitRoomI) {
		await this.playService.removePlayRoom(data);
		const me = await this.getSessionUser(client);
		var oponent;
		if (me.login == data.player1.login)
		 	oponent = await this.playService.getPlayer(data.player2);
		else
			oponent = await this.playService.getPlayer(data.player1);
		data.ready = false;
		// ON_WAIT_ROOM_REJECT has to be changed to ON_ROOM_UPDATE
		this.socketService.emitToOne(this.server, ePlay.ON_WAIT_ROOM_REJECT, me.login, oponent, data);
		this.socketService.emitToOne(this.server, ePlay.ON_WAIT_ROOM_REJECT, me.login, me, data);
		this.server.emit(ePlay.ON_GET_LIVE_GAMES, me.login, await this.playService.onGetLiveGames());
	}

	private async getSession(client: any)
	{
		try {
			const token = client.handshake.headers.authorization.split(' ')[1];
			const session = await this.sessionService.findSessionWithRelation(token);
			return (session);
		} catch (error) {}
	}
	private async getSessionUser(client: any)
	{
		const session = await this.getSession(client);	
		return (session.userID);	
	}

	//Posibly can be deleted
	private async emitToAll(recivers: UserPublicInfoI[], data?: any)
	{
		for (let i = 0; i < recivers.length; i++) {
			const reciver = await this.userService.findByLogin(recivers[i].login);
			this.socketService.emitToOne(this.server, ePlay.ON_GAME_END, undefined, reciver, data);	
		}
	}
}