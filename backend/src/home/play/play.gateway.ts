import { WebSocketGateway, SubscribeMessage } from '@nestjs/websockets';
import { SessionService } from 'src/session/session.service';
import { mDate } from 'src/shared/utils/date';
import { SocketService } from 'src/socket/socket.service';
import { UserEntity } from '../user/user.entity';
import { User } from '../user/userClass';
import { ePlay, eRequestPlayer } from './ePlay';
import { PlayerI, WaitRoomI } from './iPlay';
import { PlayEntity } from './play.entity';
import { PlayService } from './play.service';

@WebSocketGateway({ cors: true })
export class PlayGateway {
	server: any;
	timeLap: number = 120;
	constructor(private socketService: SocketService,
                private playService: PlayService,
				private sessionService: SessionService){}

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
		console.log("<debug> onAcceptInvitation:", data);
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
		console.log("<debug> onDeclineInvitation:", data);
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
}