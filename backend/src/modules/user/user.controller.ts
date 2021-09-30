import { Controller, Get, Post, Body, Query, UseInterceptors, UploadedFile} from '@nestjs/common';
import { users } from 'src/shared/entity/user.entity';
import { UserService } from './user.service';
import { CodeI } from './model/code/i2factor';
import { User } from './model/user/cUser';
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from 'multer';

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
	async registerUser(@Body() body: User): Promise<User>
	{
		const data = await this.userService.insertUser(body);
		return (data);
	}

	@Post('/code2factor')
	async send2factor(@Body() body: any): Promise<CodeI> 
	{
		const data = await this.userService.sendCode(body);
		return (data);
	}
	@Post('/code2factor/resend')
	async reSend2factor(@Body() body: any): Promise<CodeI>
	{
		const data = await this.userService.reSendCode(body);
		return (data);
	}
	@Post('/code2factor/validate')
	async validate2factor(@Body() body: any): Promise<any>
	{
		const data = await this.userService.validateCode(body);
		return (data);
	}
	
	@Post('/confirmation')
	async confirmUser(@Body() body: any): Promise<any>
	{
		return (await this.userService.confirmUser(body.uuid));
	}

	@Post('/updateUser')
	async updateUser(@Body() body: User): Promise<boolean>
	{
		return (await this.userService.updateUser(body));
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

	@Post('/imageUpload')
	@UseInterceptors(FileInterceptor('image', {
		limits: {
			files: UserService.limitFilesHelper(),
			fileSize: UserService.limitSizeHelper()
		},
		storage: diskStorage({
			destination: UserService.destinationHelper,
			filename: UserService.fileNemaHelper
		}),
		fileFilter: UserService.filterHelper
	}))
	async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<any> {
		if (file !== undefined)
			return (await file.originalname);
		return (false);
	}
}