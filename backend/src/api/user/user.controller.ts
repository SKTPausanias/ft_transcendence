import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { users } from 'src/entity/user.entity';
import { UserService } from 'src/service/user/user.service';

@Controller('api/user')
export class UserController {
    constructor (private userService: UserService){}
    @Get()
	async getAllUsers(): Promise<users[]>
	{
		const data = await this.userService.findAll();
		console.log(data);
        return (data);
	}
	@Post('/registration')
	async registerUser(@Body() body: any): Promise<any>
	{
		const data = await this.userService.insertUser(body);
		console.log("register user data: ",  data);
		//body.status = 2;
		return (data);
	}
	@Post('/confirmation')
	async updateUser(@Body() body: any): Promise<any>
	{
		const data = await this.userService.confirmUser(body);
		console.log("confirm data :" + data);
		//body.status = 2;
		return (data);
	}
	@Get('/data')
	async getUserData(@Query() param: any): Promise<any>{
		console.log("get user data param: ", param);
		console.log("get user data param.id: ", param.id);
		const response = await this.userService.findById(param.id);
		console.log("user by id: ", response);
		return (response);
	}

}
