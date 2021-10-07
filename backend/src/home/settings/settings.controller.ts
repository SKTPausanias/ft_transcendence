import { Controller } from '@nestjs/common';
import { Get, Headers } from '@nestjs/common';
import { SettingsService } from './settings.service';


@Controller('api/users/settings')
export class SettingsController {
    constructor(private settingService: SettingsService){}
}
