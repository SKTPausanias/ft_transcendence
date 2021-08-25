import { Controller, Get } from '@nestjs/common';
import { users } from 'src/entity/user.entity';
import { UserService } from 'src/service/user/user.service';

@Controller('user')
export class UserController {
    constructor (private userService: UserService){}
    @Get()
	async register(): Promise<users[]>
	{
		const data = await this.userService.findAll();
		console.log(data);
        return (data);
	}
}
