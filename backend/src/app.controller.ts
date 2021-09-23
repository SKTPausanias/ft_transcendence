import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { pepe } from './modules/user/model/code/i2factor';

@Controller()
export class AppController {

	tok: string = "";
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<string> {
    return this.appService.getHello();
  }
  @Post()
  create(@Body() createUserDto: pepe)
  {
    return ('hello from pipe validation');
  }
}
