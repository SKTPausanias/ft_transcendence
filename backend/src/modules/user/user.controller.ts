import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { users } from 'src/shared/entity/user.entity';
import { UserService } from './user.service';


@Controller('/api/user')
export class UserController {
    constructor (private userService: UserService){}
    @Get()
	async getAllUsers(): Promise<users[]>
	{
		const data = await this.userService.findAll();
        return (data);
	}
	@Post('/registration')
	async registerUser(@Body() body: any): Promise<any>
	{
		const data = await this.userService.insertUser(body);
		return (data);
	}

	@Post('/code2factor')
	async send2factor(@Body() body: any): Promise<any>
	{
		const data = await this.userService.sendEmailCode(body);
		return (data);
	}
	
	@Post('/confirmation')
	async confirmUser(@Body() body: any): Promise<any>
	{
		return (await this.userService.confirmUser(body.uuid));
	}

	@Post('/updateUser')
	async updateUser(@Body() body: any): Promise<any>
	{
		const data = await this.userService.updateUser(body);
		return (data);
	}
	
	@Get('/data')
	async getUserData(@Query() param: any): Promise<any>{
		const response = await this.userService.findById(param.id);
		return (response);
	}
	@Get('/delete')
	async deleteUserAccount(@Query() param: any): Promise<any> {
		const response = await this.userService.deleteById(param.id);
		return (response);
	}

}
