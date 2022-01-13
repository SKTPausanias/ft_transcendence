import { WebSocketGateway, SubscribeMessage } from '@nestjs/websockets';
import { SessionService } from 'src/session/session.service';
import { mDate } from 'src/shared/utils/date';
import { SocketService } from 'src/socket/socket.service';
import { UserEntity } from '../user/user.entity';
import { User } from '../user/userClass';
import { ePlay, eRequestPlayer } from './ePlay';
import { PlayerI, WaitRoomI } from './iPlay';
import { PlayService } from './play.service';

@WebSocketGateway({ cors: true })
export class PlayGateway {
	server: any;
	constructor(private socketService: SocketService,
                private playService: PlayService,
				private sessionService: SessionService){}

	init(server: any){
		this.server = server;
	}

	@SubscribeMessage(ePlay.ON_START_PLAY)
	async onStart(client, data) {
        console.log("<debug> onStart:", data);
		//emit to both players
		await this.socketService.emitToSelf(this.server, ePlay.ON_START_PLAY, data.player1.login, data);
		await this.socketService.emitToSelf(this.server, ePlay.ON_START_PLAY, data.player2.login, data);
	}

	@SubscribeMessage(ePlay.ON_STOP_PLAY)
	async onStop(client, data) {
		console.log("<debug> onStop:", data);
		await this.playService.endGame(data);
		// add boolean to data to know if the game is finished

		//emit to all players
		//emit to both players / habrá que pasarselo a todos
		//rename emitToSelf
		await this.socketService.emitToSelf(this.server, ePlay.ON_STOP_PLAY, data.game.player1.login, {data, finished: true});
		await this.socketService.emitToSelf(this.server, ePlay.ON_STOP_PLAY, data.game.player2.login, {data, finished: true});
	}
	@SubscribeMessage(ePlay.ON_LOAD_ALL_GAME_INVITATIONS)
	async onLoadAllGameInvitations(client, data) {
		const me = await this.getSessionUser(client);
		const invitations = await this.playService.getAllGameInvitations(me);
		this.server.to(client.id).emit(ePlay.ON_LOAD_ALL_GAME_INVITATIONS, me.login, invitations);
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
		console.log("<debug> onAcceptInvitation:", data);
		var waitRoom: WaitRoomI = <WaitRoomI>{};
		const me = await this.getSessionUser(client);
		const oponent = await this.playService.acceptGameInvitation(me, data);
		waitRoom.player1 = this.createPlayer(me);
		waitRoom.player2 = this.createPlayer(oponent);
		waitRoom.expires = mDate.setExpirationTime(20);
		this.server.to(client.id).emit(ePlay.ON_ACCEPT_INVITATION, me.login, waitRoom);
		this.socketService.emitToOne(this.server, ePlay.ON_ACCEPT_INVITATION, me.login, oponent, waitRoom);
	}

	@SubscribeMessage(ePlay.ON_DECLINE_INVITATION)
	async onDeclineInvitation(client, data) {
		console.log("<debug> onDeclineInvitation:", data);
		const me = await this.getSessionUser(client);
		await this.playService.declineGameInvitation(me, data);
		this.server.to(client.id).emit(ePlay.ON_DECLINE_INVITATION, data);
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

	@SubscribeMessage(ePlay.ON_PLAY_READY)
	async onPlayTest(client, data) {
		
		const me = await this.getSessionUser(client);
		const resp = await this.playService.onTest(me, data.oponent);
		
		console.log("on test client id from play.gateway: ", client.id);
		this.server.to(client.id).emit(ePlay.ON_PLAY_READY, me.login, data.msg);
		this.socketService.emitToOne(this.server, ePlay.ON_PLAY_READY, me.login, resp, data.msg);
	}

	@SubscribeMessage(ePlay.ON_WAIT_ROOM_REJECT)
	async onWaitRoomReject(client, data) {
		
		const me = await this.getSessionUser(client);
		const resp = await this.playService.onTest(me, data.oponent);
		
		this.server.to(client.id).emit(ePlay.ON_WAIT_ROOM_REJECT, me.login, ePlay.ON_WAIT_ROOM_REJECT);
		this.socketService.emitToOne(this.server, ePlay.ON_WAIT_ROOM_REJECT, me.login, resp, ePlay.ON_WAIT_ROOM_REJECT);
	}

	private	createPlayer(user: UserEntity,): PlayerI
	{
		return ({
			id : user.id,
			nickname : user.nickname,
			login: user.login,
			avatar : user.avatar,
			status : eRequestPlayer.WAITING
		})
		
	}
}