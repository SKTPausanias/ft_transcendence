import { Injectable, Res } from '@nestjs/common';
import * as speakeasy from 'speakeasy'
import * as qrCode from "qrcode"
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwoFactorEntity } from './two-factor.entity';
import { mDate } from 'src/shared/utils/date';
import { UserEntity } from 'src/home/user/user.entity';
import { Exception } from 'src/shared/utils/exception';
import { Response } from 'src/shared/response/responseClass';
import { ErrorParser } from 'src/shared/utils/errorParser';



@Injectable()
export class TwoFactorService {

	constructor(@InjectRepository(TwoFactorEntity)
	private twoFactorRepository: Repository<TwoFactorEntity>){
		
	}
	async newSecret(user: UserEntity){
		const secret = speakeasy.generateSecret();
		const secretObj = {
			base: secret.base32,
			otpauth_url: secret.otpauth_url,
			expiration_time: mDate.setExpirationTime(60 * 60 * 24 * 90), //90 days;
			userID : user
		}
		try {
			return (await this.twoFactorRepository.save(secretObj));
		} catch (error) {
			throw new Exception(Response.makeResponse(500, ErrorParser.parseDbSaveExeption(error)))

		}
	}
	async generateToken(user: UserEntity){
		try {
			var twoFactor =  await this.twoFactorRepository.findOne({ where: { userID: user.id } });
			if (twoFactor === undefined)
				twoFactor = await this.newSecret(user);
			const token = speakeasy.totp({
				secret: twoFactor.base,
				encoding: 'base32'
			});
			console.log("generate token: ", token);
			return (token);	
		} catch (error) {
			throw new Exception(Response.makeResponse(500, {error : "Can't generate token"}))
		}
	}
	async generateQr(user: UserEntity){
		try {
			const twoFactor =  await this.twoFactorRepository.findOne({ where: { userID: user.id } });
			return (await qrCode.toDataURL(twoFactor.otpauth_url));
		} catch (error) {
			throw new Exception(Response.makeResponse(500, {error : "Can't generate QR"}))
		}
		
	}
	async validateToken(user: UserEntity, token: number){
		try {
			var twoFactor =  await this.twoFactorRepository.findOne({ where: { userID: user.id } });
			var verified = speakeasy.totp.verify({ 
				secret: twoFactor.base,
				encoding: 'base32',
				token: token,
				window: 4});
			return (verified);
		} catch (error) {
			throw new Exception(Response.makeResponse(500, {error : "Can't validate token"}))
		}	
	}
	async removeSecret(user: UserEntity)
	{
		try {
			const secret = await this.twoFactorRepository.findOne({where: {userID: user.id}});
			await this.twoFactorRepository.remove(secret);
		} catch (error) {
			throw new Exception(Response.makeResponse(500, {error : "Can't remove secret"}))
		}
	}
}
