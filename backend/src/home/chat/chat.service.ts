import { Injectable } from '@nestjs/common';
import { SessionService } from 'src/session/session.service';
import { UserService } from '../user/user.service';

@Injectable()
export class ChatService {
    constructor(
        private sessionService: SessionService,
        private userService: UserService
        ){}
}
