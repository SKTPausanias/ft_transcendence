import { Controller, Get } from '@nestjs/common';
import { UserEntity } from 'src/entity/user.entity';
import { UserService } from 'src/service/user/user.service';

@Controller('user')
export class UserController {
    constructor (private userService: UserService){}
    @Get()
	public register(): any
	{
        //console.log("Data from db: ")
        //console.log(data);
        return (this.userService.findAll());
	}
}
