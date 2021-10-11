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
			const test1 = await this.friendRepository.findOne({where: [ //where user.id && friend.id
					{ user_1 : session.userID.id },
					{ user_2 : friend.id }
				]
			});

			const test2 = await this.friendRepository.findOne({where: [ //where user.id && friend.id
					{ user_2 : session.userID.id },
					{ user_1 : friend.id }
				]
			});
			if (test1 !== undefined)
				console.log("INVITER: NOT ALLOWED TO CONFIRM.");
			if (test2 !== undefined)
				console.log("CONFIRMER: BINGO!!! SET CONFIRM TO TRUE & UPDATE THE ROW");
			console.log("Test1: ", test1);
			console.log("Test2: ", test2);

			//Si se llama a findOne la comprobacion !== undefined
			if (test1 === undefined && test2 === undefined)
				return (await this.friendRepository.save({ user_1: session.userID, user_2: friend }));
			else if (test1 === undefined && test2 !== undefined && test2.confirmed === false){
				console.log("Accpeting friendship: ");
				return (await this.friendRepository.save({ id: test2.id, confirmed: true }));
			}
			// SE PUEDE REUTILIZAR ESTE SERVICIO EN MOMENTO CUANDO HAY QUE ACTUALIZAR LA COLUMNA:
			// @Column('boolean', {default: false})
    		// confirmed: boolean;
			// CREO QUE LAS LINEAS QUE VIENEN FUNCIOANARIA. ASI DE FRONTEND PODRIAMOS LLAMAR A MISMA API
			//else if (test1 !== undefined)
			//  NOTHING TO DO THIS IS INVITER
			//else if (test2 !== undefined)
			// test2.confirmed = true;
			// save this.friendRepository.save(test2)
			// MAÑANA NOS VEMOS!
		}catch (e) {
			return (e);
		}
	}

    async removeFriend(user, header): Promise<any> {
        try {
            const token = header.authorization.split(' ')[1];
            const session = await this.sessionService.findSessionWithRelation(token);
            const friend = await this.userService.findByNickname(user.nickname);

			const test1 = await this.friendRepository.findOne({where: [ //where user.id && friend.id
                    { user_1 : session.userID.id },
                    { user_2 : friend.id }
                ]
            });
            const test2 = await this.friendRepository.findOne({where: [ //where user.id && friend.id
                    { user_2 : session.userID.id },
                    { user_1 : friend.id }
                ]
            });

            if (test1 !== undefined)
                return (await this.friendRepository.remove(test1));
            else if (test2 !== undefined)
                return (await this.friendRepository.remove(test2));
        }
        catch (e) {
            return (e);
        }
    }
}
