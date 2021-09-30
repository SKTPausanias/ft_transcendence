import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class HashService {

	hash(pwd: string): string{
		const salt = bcrypt.genSaltSync(10);
		return (bcrypt.hashSync(pwd, salt));
	}
	async compare(pwd: string, hashed: string): Promise<boolean>{
		return (await bcrypt.compare(pwd, hashed));
	}
}
