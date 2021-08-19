import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {

	tok: string = "";
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<string> {
	  console.log("llega");
    return this.appService.getHello();
  }
}
