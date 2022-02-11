import { WebSocketGateway, SubscribeMessage } from "@nestjs/websockets";
import { SessionService } from "src/session/session.service";
import { SocketService } from "src/socket/socket.service";
import { UserEntity } from "../user/user.entity";
import { User } from "../user/userClass";
import { ePlay } from "./ePlay";
import { WaitRoomI } from "./iPlay";
import { PlayService } from "./play.service";
import { UserService } from "../user/user.service";
import { Game } from "./classes/game";

@WebSocketGateway({ cors: true })
export class PlayGateway {
  server: any;
  timeLap: number;
  games: Game[];
  matchMaking: UserEntity[];

  constructor(
    private socketService: SocketService,
    private playService: PlayService,
    private userService: UserService
  ) {
    this.timeLap = 120;
    this.games = [];
    this.matchMaking = [];
  }

  init(server: any) {
    this.server = server;
  }

  @SubscribeMessage(ePlay.ON_LOAD_ALL_GAME_INVITATIONS)
  async onLoadAllGameInvitations(client, data) {
    const me = await this.playService.getSessionUser(client);
    const invitations = await this.playService.getAllGameInvitations(me);
    this.server
      .to(client.id)
      .emit(ePlay.ON_LOAD_ALL_GAME_INVITATIONS, me.login, invitations);
  }

  @SubscribeMessage(ePlay.ON_LOAD_ACTIVE_WAIT_ROOM)
  async onLoadActiveWaitRoom(client, data) {
    const me = await this.playService.getSessionUser(client);
    const playRoom = await this.playService.getActivePlayRoom(me);
    if (playRoom !== undefined)
      this.server
        .to(client.id)
        .emit(
          ePlay.ON_LOAD_ACTIVE_WAIT_ROOM,
          this.playService.createWaitRoom(playRoom)
        );
  }

  @SubscribeMessage(ePlay.ON_REQUEST_INVITATION)
  async onRequestInvitation(client, data) {
    const me = await this.playService.getSessionUser(client);
    const opUser = await this.playService.newInviation(me, data);
    if (opUser != null)
      this.socketService.emitToOne(
        this.server,
        ePlay.ON_REQUEST_INVITATION,
        me.login,
        opUser,
        User.getPublicInfo(me)
      );
  }

  @SubscribeMessage(ePlay.ON_ACCEPT_INVITATION)
  async onAcceptInvitation(client, data) {
    var waitRoom: WaitRoomI = <WaitRoomI>{};
    const me = await this.playService.getSessionUser(client);
    const invitation = await this.playService.acceptGameInvitation(me, data);
    if (invitation == null) return;
    waitRoom = this.playService.createWaitRoom(invitation);

    for (var i = 0; i < this.matchMaking.length; i++)
      if ((await this.playService.getActivePlayRoom(this.matchMaking[i])) !== undefined)
        this.matchMaking.splice(i, 1);

    this.socketService.emitToOne(
      this.server,
      ePlay.ON_ACCEPT_INVITATION,
      me.login,
      invitation.player_1,
      waitRoom
    );
    this.socketService.emitToOne(
      this.server,
      ePlay.ON_ACCEPT_INVITATION,
      me.login,
      invitation.player_2,
      waitRoom
    );
  }

  @SubscribeMessage(ePlay.ON_DECLINE_INVITATION)
  async onDeclineInvitation(client, data) {
    const me = await this.playService.getSessionUser(client);
    await this.playService.declineGameInvitation(me, data);
    this.server.to(client.id).emit(ePlay.ON_DECLINE_INVITATION, data);
  }

  @SubscribeMessage(ePlay.ON_WAIT_ROOM_ACCEPT)
  async onWaitRoomAccept(client, data) {
    const me = await this.playService.getSessionUser(client);
    const invitation = await this.playService.acceptWaitRoom(me, data);
    const waitRoom = this.playService.createWaitRoom(invitation);
    this.socketService.emitToOne(
      this.server,
      ePlay.ON_WAIT_ROOM_ACCEPT,
      me.login,
      invitation.player_1,
      waitRoom
    );
    this.socketService.emitToOne(
      this.server,
      ePlay.ON_WAIT_ROOM_ACCEPT,
      me.login,
      invitation.player_2,
      waitRoom
    );
    this.server.emit(
      ePlay.ON_GET_LIVE_GAMES,
      me.login,
      {lives: await this.playService.onGetLiveGames()}
    );
  }

  @SubscribeMessage(ePlay.ON_WAIT_ROOM_REJECT)
  async onWaitRoomReject(client, data: WaitRoomI) {
    await this.playService.removePlayRoom(data);
    const me = await this.playService.getSessionUser(client);
    var oponent;
    if (me.login == data.player1.login)
      oponent = await this.playService.getPlayer(data.player2);
    else oponent = await this.playService.getPlayer(data.player1);
    data.ready = false;
    this.socketService.emitToOne(
      this.server,
      ePlay.ON_WAIT_ROOM_REJECT,
      me.login,
      oponent,
      data
    );
    this.socketService.emitToOne(
      this.server,
      ePlay.ON_WAIT_ROOM_REJECT,
      me.login,
      me,
      data
    );
  }

  @SubscribeMessage(ePlay.ON_GET_LIVE_GAMES)
  async onGetLiveGames(client) {
    const me = await this.playService.getSessionUser(client);
    const games = await this.playService.onGetLiveGames();
    this.socketService.emitToOne(
      this.server,
      ePlay.ON_GET_LIVE_GAMES,
      me.login,
      me,
      {lives: games, delView: true}
    );
  }

  @SubscribeMessage(ePlay.ON_START_STREAM)
  async onStartStream(client, data: WaitRoomI) {
    if (data !== undefined) {
		//const me = await this.playService.getSessionUser(client)
		const game = await this.playService.findGameById(data.id);
		//const gameViewers = await this.playService.addViewer(me, data);
		if (game !== undefined && this.games.length > 0) {
		  var obj = this.games.find((item) => item.getId() == game.id);
		  this.server
			  .to(client.id)
			  .emit(ePlay.ON_START_STREAM, { gameInfo: obj.getMap() });
		  }
    }
  }

  @SubscribeMessage(ePlay.ON_STOP_STREAM)
  async onStopStream(client, data: WaitRoomI) {
      const me = await this.playService.getSessionUser(client);
      const game = await this.playService.removeViewer(me, data);
      if (game == undefined) return;
        var gameI = this.playService.createWaitRoom(game);

    this.socketService.emitToOne(
      this.server,
      ePlay.ON_WAIT_ROOM_ACCEPT,
      me.login,
      game.player_1,
      gameI
    );
    this.socketService.emitToOne(
      this.server,
      ePlay.ON_WAIT_ROOM_ACCEPT,
      me.login,
      game.player_2,
      gameI
    );
    
    //const game = await this.playService.findGameById(data.id);
    if (game !== undefined){
        /* emit player_1, player_2 & viewers */
        this.socketService.emitToOne(this.server, ePlay.ON_GET_LIVE_VIEWERS, me.login, game.player_1, game.viewers.length);
        this.socketService.emitToOne(this.server, ePlay.ON_GET_LIVE_VIEWERS, me.login, game.player_2, game.viewers.length);
        this.socketService.emitToAll(this.server, ePlay.ON_GET_LIVE_VIEWERS, me.login, game.viewers, game.viewers.length);
      }

  }

  @SubscribeMessage(ePlay.ON_SET_LIVE_VIEWERS)
  async onSetLiveViewers(client, data: WaitRoomI) {
    if (data !== undefined) {
      const me = await this.playService.getSessionUser(client)
      const game = await this.playService.addViewer(me, data);
      if (game !== undefined){
        /* emit player_1, player_2 & viewers */
        this.socketService.emitToOne(this.server, ePlay.ON_GET_LIVE_VIEWERS, me.login, game.player_1, game.viewers.length);
        this.socketService.emitToOne(this.server, ePlay.ON_GET_LIVE_VIEWERS, me.login, game.player_2, game.viewers.length);
        this.socketService.emitToAll(this.server, ePlay.ON_GET_LIVE_VIEWERS, me.login, game.viewers, game.viewers.length);
      }
    }
  }

  @SubscribeMessage(ePlay.ON_GET_LIVE_VIEWERS)
  async onGetLiveViewers(client, data: WaitRoomI) {
    if (data !== undefined) {
      const me = await this.playService.getSessionUser(client)
      const game = await this.playService.findGameById(data.id);
      if (game !== undefined){
        /* emit player_1, player_2 & viewers */
        this.socketService.emitToOne(this.server, ePlay.ON_GET_LIVE_VIEWERS, me.login, game.player_1, game.viewers.length);
        this.socketService.emitToOne(this.server, ePlay.ON_GET_LIVE_VIEWERS, me.login, game.player_2, game.viewers.length);
        this.socketService.emitToAll(this.server, ePlay.ON_GET_LIVE_VIEWERS, me.login, game.viewers, game.viewers.length);
      }
    }
  }

  @SubscribeMessage(ePlay.ON_GAME_END)
  async onGameEnd(client, data: any) {
    const me = await this.playService.getSessionUser(client);
    var oponent;
    if (data.game !== undefined)
      await this.playService.endGame(data.game, data.wRoom);
    if (me.login == data.wRoom.player1.login)
      oponent = await this.playService.getPlayer(data.wRoom.player2);
    else 
      oponent = await this.playService.getPlayer(data.wRoom.player1);
    data.wRoom.ready = false;//WTF
    await this.playService.removePlayRoom(data.wRoom);

    this.socketService.emitToOne(
      this.server,
      ePlay.ON_WAIT_ROOM_REJECT,
      me.login,
      oponent,
      data.wRoom
    );
    this.socketService.emitToOne(
      this.server,
      ePlay.ON_WAIT_ROOM_REJECT,
      me.login,
      me,
      data.wRoom
    );
    this.server.emit(
      ePlay.ON_GET_LIVE_GAMES,
      me.login,
      {lives: await this.playService.onGetLiveGames()}
    );
    console.log("Finishing...");
    if (data.wRoom.id !== undefined)
      this.games = this.games.filter(item => item.getId() != data.wRoom.id);
  }

  @SubscribeMessage(ePlay.ON_START_GAME)
  async onStartGame(client, data: number) {
    const game = await this.playService.findGameById(data);
    const me = await this.playService.getSessionUser(client);
    if (game !== undefined) {
      var gameObj = new Game(game.id, game.play_modes[0]);
      this.games.push(gameObj);
      this.server
        .to(client.id)
        .emit(ePlay.ON_START_GAME, { gameInfo: gameObj.getMap() });
      this.server.emit(
        ePlay.ON_GET_LIVE_GAMES,
        me.login,
        {lives: await this.playService.onGetLiveGames()}
      );
    }
  }

  @SubscribeMessage(ePlay.ON_GAME_WINNER)
  async onGameWinner(client, data: any) {
    var user = await this.userService.findByLogin(data.winner.login);

    this.socketService.emitToOne(
      this.server,
      ePlay.ON_GAME_WINNER,
      data.winner.login,
      user,
      "you win!"
    );

    user = await this.userService.findByLogin(data.loser.login);
    this.socketService.emitToOne(
      this.server,
      ePlay.ON_GAME_WINNER,
      data.winner.login,
      user,
      "you lose :("
    ); 
  }

  @SubscribeMessage(ePlay.ON_GAME_MOVING)
  async onGameMoving(client, data: any) {
    const game = await this.playService.findGameById(data.id);
    if (game !== undefined && this.games.length > 0) {
      var obj = this.games.find((item) => item.getId() == game.id);
      if (obj !== undefined && !obj.gameFinished) {
        if (obj.gameInterval === undefined) {
          console.log("Finishing...");
		      obj.checkCollisions();
          obj.ball.move();
          obj.gameFinished = true;
        }
        if (data.p1) {
          if (data.shoots && obj.game_mode == 2)
            obj.pad_1.setShoots(data.shoots);
          if (data.up && obj.boundPad_1.top > 0) obj.pad_1.moveUp();
          else if (data.down && obj.boundPad_1.bottom < obj.cHeight)
            obj.pad_1.moveDown();
        } else {
          if (data.shoots && obj.game_mode == 2)
            obj.pad_2.setShoots(data.shoots);
          if (data.up && obj.boundPad_2.top > 0) obj.pad_2.moveUp();
          else if (data.down && obj.boundPad_2.bottom < obj.cHeight)
            obj.pad_2.moveDown();
        }
        this.server
          .to(client.id)
          .emit(ePlay.ON_GAME_MOVING, { gameInfo: obj.getMap() });
      }
    }
  }

  @SubscribeMessage(ePlay.ON_MATCH_MAKING)
  async onMatchMaking(client): Promise<void> {
    const player_1 = await this.playService.getSessionUser(client);
    if (this.matchMaking.find(item => item.login == player_1.login) === undefined) {
      if (this.matchMaking.length > 0) {
        for (var i = 0; i < this.matchMaking.length; i++) {
          if ((await this.playService.getActivePlayRoom(this.matchMaking[i])) !== undefined)
            this.matchMaking.splice(i, 1);
        }
      }
      if (this.matchMaking.length <= 0)
        this.matchMaking.push(player_1);
      else if (this.matchMaking.length > 0) {
        var player_2 = this.matchMaking.pop();
        var waitRoom: WaitRoomI = await this.playService.matchMaking(player_1, player_2);
        if (waitRoom != null) {
          this.socketService.emitToOne(
            this.server,
            ePlay.ON_ACCEPT_INVITATION,
            player_1.login,
            player_1,
            waitRoom
          );
          this.socketService.emitToOne(
            this.server,
            ePlay.ON_ACCEPT_INVITATION,
            player_1.login,
            player_2,
            waitRoom
          );
        }
      }
    }
  }

	@SubscribeMessage(ePlay.ON_CANCEL_MATCH_MAKING)
	async onCancelMatchMaking(client: any): Promise<void> {
		const usr = await this.playService.getSessionUser(client);
		this.matchMaking = this.matchMaking.filter(item => item.login != usr.login);
	}
	@SubscribeMessage(ePlay.ON_SELECT_PLAY_MODE)
	async onSelectPlayMode(client: any, data: any): Promise<void> {
		const me = await this.playService.getSessionUser(client);
		const room = await this.playService.diselectPlayMode(data, me);
		if (!room)
			return ;
		this.socketService.emitToOne(
			this.server,
			ePlay.ON_SELECT_PLAY_MODE,
			me.login,
			room.player_1,
			this.playService.createWaitRoom(room)
		);
		this.socketService.emitToOne(
			this.server,
			ePlay.ON_SELECT_PLAY_MODE,
			me.login,
			room.player_2,
			this.playService.createWaitRoom(room)
		);
	}
}
