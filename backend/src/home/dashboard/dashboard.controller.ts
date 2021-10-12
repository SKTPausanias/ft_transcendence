import { Body, Controller, Post, Query } from '@nestjs/common';
import { Get, Headers } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('api/users/dashboard')
export class DashboardController {
    constructor(private dashboardService: DashboardService){}
	@Get('/search')
	async search(@Query() query, @Headers() headers){
		if (query.match !== undefined)
			return await this.dashboardService.searchUser(query.match, headers);
	}
	@Post('/addFriend')
	async addFriend(@Body() user: any, @Headers() headers) {
		return (await this.dashboardService.addFriend(user, headers));
	}

	@Post('/removeFriend')
	async removeFriend(@Body() user: any, @Headers() headers) {
		return (await this.dashboardService.removeFriend(user, headers));
	}
}
