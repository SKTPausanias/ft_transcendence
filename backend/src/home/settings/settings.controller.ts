import { Body, Controller, Delete, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Get, Headers } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SettingsService } from './settings.service';
import { diskStorage } from 'multer';
import { Response } from 'src/shared/response/responseClass';
import { User } from '../user/userClass';
import { UserI } from '../user/userI';


@Controller('api/users/settings')
export class SettingsController {
    constructor(private settingService: SettingsService){}
	@Get('/delete')
	async deleteUser(@Headers() headers){
		return await this.settingService.deleteUser(headers);
	}
	@Post('/update')
	async updateUser(@Body() body : User, @Headers() header){
		return await this.settingService.updateUser(body, header);
	}
	@Post('/imageUpload')
	@UseInterceptors(FileInterceptor('image', {
		limits: {
			files: SettingsService.limitFilesHelper(),
			fileSize: SettingsService.limitSizeHelper()
		},
		storage: diskStorage({
			destination: SettingsService.destinationHelper,
			filename: SettingsService.fileNemaHelper
		}),
		fileFilter: SettingsService.filterHelper
	}))
	async uploadImage(@UploadedFile() file: Express.Multer.File, @Headers() header): Promise<any> {
		if (file !== undefined)
			return (await this.settingService.updateUserAvatar(header, file.filename));
		return (Response.makeResponse(500, {error : "failed to upload avatar"}));
	}

}
