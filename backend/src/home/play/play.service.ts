import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Like, Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { UserService } from "../user/user.service";

@Injectable()
export class PlayService {
    constructor(@InjectRepository(UserEntity)
                private userRepository: Repository<UserEntity>,
                @Inject(forwardRef(() => UserService)) // forwardRef solves circular dependencies: 
				private userService: UserService,){}
            
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