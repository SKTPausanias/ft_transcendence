import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { users } from '../../entity/user.entity';

@Injectable()
export class UserService {

    constructor (@InjectRepository(users)
            private repository: Repository<users>){}
    
    findAll() : Promise<users[]> {
        
        return (this.repository.find());
    }

    insertUser(user : any) : Promise<any> {
        console.log("user:" + user);
        user.status = 1;
        const data = this.repository.insert({
            id: user.id,
            email: user.email,
            login: user.login,
            nickname: user.nickname,
            first_name: user.first_name,
            last_name: user.last_name,
            status: user.status,
            role: user.role,
        });
        console.log("data after insert : " + data);
        return (data);
    }
}
