import { Controller, Post, Get, Body, Delete, Headers} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/home/user/userClass';
import { HashService } from 'src/shared/hash/hash.service';
import { UserService } from 'src/home/user/user.service';
import { UserRegI } from 'src/home/user/userI';

@Controller('api')
export class AuthController {
	constructor(private authService: AuthService){}
	@Post('/login')
	async login(@Body() body: any){
		return (await this.authService.login(body));
	}

	@Post('/ftLogin')
	async ftLogin(@Body() body: any){
		return (await this.authService.ftLogin(body.code));
	}
	
	@Post('/signUp')
	async signUp(@Body() body: User){
		return (await this.authService.signUp(body));
	}
	
	@Post('/ftSignUp')
	async ftSignUp(@Body() body: any){
		return (await this.authService.ftSignUp(body.code));
	}
	
	@Post('/confirmation')
	async confirmation(@Body() body: any){
		return (await this.authService.confirm(body));
	}
	@Post('/confirmation/resend')
	async resendConfirmation(@Body() body: any){
		return (await this.authService.resendConfirmation(body.email));
	}
	@Post('/code/generate')
	async generateCode(@Body() body: any){
		return (await this.authService.generateToken(body.email));
	}
	@Post('/code/validate')
	async validateCode(@Body() body: any){
		return (await this.authService.validateToken(body.email, body.code));
	}
	@Delete('/logout')
	async logout(@Headers() headers){
		return (await this.authService.logout(headers.authorization));
	}
	@Get('/session/check')
	async checkSession(@Headers() headers)
	{
		return (await this.authService.checkSession(headers.authorization));
	}
	/* @Get('qr')
	async getQr() {
	  return await this.authService.getQr();
	} */
}
