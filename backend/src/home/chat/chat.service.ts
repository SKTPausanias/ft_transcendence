import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionService } from 'src/session/session.service';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { FriendEntity } from './chat.entity'

@Injectable()
export class ChatService {
    constructor(
		@InjectRepository(FriendEntity) private friendRepository: Repository<FriendEntity>,
        private sessionService: SessionService,
        private userService: UserService
        ){}
	async searchUser(match: string, header: any)
	{
		try {
            const token = header.authorization.split(' ')[1];
            const session = await this.sessionService.findSessionWithRelation(token);
            return (await this.userService.findMatchByLoginNickname(match, session.userID));
        } catch (error) {
                return (error);
        }
	}
	async addFriend(user, header): Promise<any> {
		try {
			const token = header.authorization.split(' ')[1];
            const session = await this.sessionService.findSessionWithRelation(token);
			console.log("Sesion has: ", session);

			const friend = await this.userService.findByNickname(user.nickname);

			//Mejor llamar findOne
			const test1 = await this.friendRepository.find({where: [ //where user.id && friend.id
					{ user_1 : session.userID.id },
					{ user_2 : friend.id }
				]
			});

			const test2 = await this.friendRepository.find({where: [ //where user.id && friend.id
					{ user_2 : session.userID.id },
					{ user_1 : friend.id }
				]
			});

			console.log("Test1: ", test1);
			console.log("Test2: ", test2);
			//Si se llama a findOne la comprobacion !== undefined
			if (!test1.length && !test2.length)
				return (await this.friendRepository.save({ user_1: session.userID, user_2: friend }));
			// SE PUEDE REUTILIZAR ESTE SERVICIO EN MOMENTO CUANDO HAY QUE ACTUALIZAR LA COLUMNA:
			// @Column('boolean', {default: false})
    		// confirnmed: boolean;
			// CREO QUE LAS LINEAS QUE VIENEN FUNCIOANARIA. ASI DE FRONTEND PODRIAMOS LLAMAR A MISMA API
			//else if (test1 !== undefined)
			// test1.confirmed = true;
			// save this.friendRepository.save(test1)
			//else if (test2 !== undefined)
			// test2.confirmed = true;
			// save this.friendRepository.save(test2)
			// MAÑANA NOS VEMOS!
		}catch (e) {
			return (e);
		}
	}
}
