import { Injectable } from '@nestjs/common';
import { SessionService } from 'src/session/session.service';
import { Response } from 'src/shared/response/responseClass';
import { UserService } from '../user/user.service';

@Injectable()
export class ChatService {
    constructor(
        private sessionService: SessionService,
        private userService: UserService
        ){}
	async searchUser(match: string, header: any)
	{
		try {
			const token = header.authorization.split(' ')[1];
			await this.sessionService.findSession(token);
			return (await this.userService.findMatchByLoginNickname(match));
		} catch (error) {
				return (error);
		}
	}
}
