import { Controller } from '@nestjs/common';
import { Get, Headers } from '@nestjs/common';
import { SettingsService } from './settings.service';


@Controller('api/settings')
export class SettingsController {
    constructor(private settingService: SettingsService){}
    @Get('/userInfo')
	async getUserInfo(@Headers() headers){
		return (await this.settingService.getUserInfo(headers));
	}
}
