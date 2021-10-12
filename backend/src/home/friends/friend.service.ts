import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SessionService } from "src/session/session.service";
import { Response } from "src/shared/response/responseClass";
import { Exception } from "src/shared/utils/exception";
import { Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { User } from "../user/userClass";
import { UserPublicInfoI } from "../user/userI";
import { FriendEntity } from "./friend.entity";

@Injectable()
export class FriendService {
	constructor(
		@InjectRepository(FriendEntity) private friendRepository: Repository<FriendEntity>,
       // private sessionService: SessionService,
        //private userService: UserService
        ){}
		async findAllFriends(user: UserEntity): Promise<any>{
			var ret: UserPublicInfoI[] = [];
			try {
				const friendship = await this.friendRepository.find(
					{relations: ['user_1', 'user_2'],
					where: [{user_1: user.id}, {user_2 : user.id}]}
				)
				friendship.forEach(element => {
					if (element.user_1.id != user.id && element.confirmed === true)
						ret.push(User.getPublicInfo(element.user_1));
					if (element.user_2.id != user.id && element.confirmed === true)
						ret.push(User.getPublicInfo(element.user_2));
				});
				return (ret);

			} catch (error) {
				throw new Exception(Response.makeResponse(500, {error : "Can't find friends"}));
			}
		}
		async addFriend(user: UserEntity, friend: UserEntity): Promise<any> {
			try {
				const requester = await this.friendRepository.findOne({where: //where user.id && friend.id
						{ user_1 : user.id, user_2 : friend.id } // AND
				});
				const accepter = await this.friendRepository.findOne({where: //where user.id && friend.id
						{ user_2 : user.id, user_1 : friend.id }
				});

				if (requester === undefined && accepter === undefined)
					return (await this.friendRepository.save({ user_1: user, user_2: friend }));
				else if (requester === undefined && accepter !== undefined && accepter.confirmed === false)
					return (await this.friendRepository.save({ id: accepter.id, confirmed: true }));
			}catch (e) {
				throw new Exception(Response.makeResponse(500, "Can't add/confirm friendship"));
			}
		}
	async removeFriend(user: UserEntity, friend: UserEntity): Promise<any>{
		try {
			const friendship = await this.friendRepository.findOne({where: [//where user.id && friend.id
				{ user_1 : user.id, user_2 : friend.id },
				{ user_2 : user.id, user_1 : friend.id } // AND
			]});
			const resp =  (await this.friendRepository.remove(friendship));
			return (Response.makeResponse(200, resp));
		} catch (error) {
			throw new Exception(Response.makeResponse(500, {error: "Can't remove friendship"}));
		}
	}
}