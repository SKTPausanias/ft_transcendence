import { WebSocketGateway, SubscribeMessage } from '@nestjs/websockets';
import { SessionService } from 'src/session/session.service';
import { SocketService } from 'src/socket/socket.service';
import { ePlay } from './ePlay';
import { PlayService } from './play.service';

@WebSocketGateway({ cors: true })
export class PlayGateway {
	server: any;
	constructor(private socketService: SocketService,
                private playService: PlayService){}

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
}