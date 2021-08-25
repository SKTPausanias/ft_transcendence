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
}
