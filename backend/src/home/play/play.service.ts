import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Like, Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { UserPublicInfoI } from "../user/userI";
import { PlayEntity } from "./play.entity";

@Injectable()
export class PlayService {
    constructor(@InjectRepository(UserEntity)
                private userRepository: Repository<UserEntity>,
                @InjectRepository(PlayEntity)
                private playRepository: Repository<PlayEntity>,
                @Inject(forwardRef(() => UserService)) // forwardRef solves circular dependencies: 
				private userService: UserService,){}
    
    async newInviation(me: UserEntity, oponent: UserPublicInfoI): Promise<UserEntity>{
        try {
        
        const opUsr = await this.userService.findByLogin(oponent.login);
        
        /*Checks if invitation exists */
        const invitation = await this.playRepository.findOne({where: [
            {player_1: me.id, player_2: opUsr.id},
            {player_2: me.id, player_1: opUsr.id}
        ]});
        

        if (invitation !== undefined)
            return (null);
            await this.playRepository.insert({player_1: me, player_2: opUsr});
        return (opUsr);
        } catch(e){
            console.log("Error invitating oponent... from playService");
            return (null);
        }
    }
    async endGame(data: any): Promise<any> {
        console.log("<debug> PlayService.endGame:", data);
        if (data.game.player1.winner == true) {
			//find user and update score
            let user1 = await this.userRepository.findOne({login: data.game.player1.login});
            user1.victories += 1;
            await this.userRepository.save(user1);
            let user2 = await this.userRepository.findOne({login: data.game.player2.login});
            user2.defeats += 1;
            await this.userRepository.save(user2);
		}
        else if (data.game.player2.winner == true) {
            //find user and update score
            let user2 = await this.userRepository.findOne({login: data.game.player2.login});
            user2.victories += 1;
            await this.userRepository.save(user2);
            let user1 = await this.userRepository.findOne({login: data.game.player1.login});
            user1.defeats += 1;
            await this.userRepository.save(user1);
        }
    }

    
}