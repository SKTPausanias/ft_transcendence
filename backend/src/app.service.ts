import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { User } from './model/class/cUser';

@Injectable()
export class AppService {
	
	
	constructor() {}

	async getHello():  Promise<string>
	{
		return ("Hello World");
  	}
 
	
}
