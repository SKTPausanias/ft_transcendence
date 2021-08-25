import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../entity/user.entity';

@Injectable()
export class UserService {

    constructor (@InjectRepository(UserEntity)
            private repository: Repository<UserEntity>){}
    
    findAll() : Promise<UserEntity[]> {
        const data = this.repository.find();
        console.log("Data from db: " + data);
        return (data);
    }
}
