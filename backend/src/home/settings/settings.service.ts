import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionEntity } from 'src/session/session.entity';
import { Response } from 'src/shared/response/responseClass';
import { SessionService } from 'src/session/session.service';
import { User } from 'src/shared/user/userClass';

@Injectable()
export class SettingsService {
    constructor(@InjectRepository(SessionEntity)
        private sessionRepository: Repository<SessionEntity>,
        private sessionService: SessionService
        ){}
    async getUserInfo(header: any){
        const token = header.authorization.split(' ')[1];
		console.log(header);
		try {
			const session = await this.sessionRepository.findOne({ 
				relations: ["userID"], where: { token }});
			if (!this.sessionService.reNewSession(session))
				return (Response.makeResponse(410, {error : "Gone"}));
			return (Response.makeResponse(200, User.getInfo(session.userID)));
		} catch (error) {
			return (Response.makeResponse(401, {error : "Unauthorized"}));
		}
        
    }
}
