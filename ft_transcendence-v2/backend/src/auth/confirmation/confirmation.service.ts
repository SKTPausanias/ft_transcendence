import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ConfirmationEntity } from "src/auth/confirmation/confirmation.entity";
import { UserEntity } from "src/shared/user/user.entity";
import { ConfirmationI } from "src/auth/confirmation/confirmationI";
import { Repository } from "typeorm";
import { Exception } from "src/shared/utils/exception";
import { Response } from "src/shared/response/responseClass";
import { ErrorParser } from "src/shared/utils/errorParser";

@Injectable()
export class ConfirmService {

	constructor(@InjectRepository(ConfirmationEntity)
	private confirmationRepository: Repository<ConfirmationEntity>){}

	async findOne( usr: UserEntity): Promise<ConfirmationEntity | undefined> {
		try {
			return await this.confirmationRepository.findOne({ where: { userID: usr.id } });
		} catch (error) {
			throw new Exception(Response.makeResponse(500, "Can't find confirmation"));
		}
	}
	async remove(confirmation: ConfirmationEntity)
	{
		try {
			await this.confirmationRepository.remove(confirmation);
		} catch (error) {
			throw new Exception(Response.makeResponse(500, "Can't delete confirmation"));
		}
	}
	async save(confirmation: ConfirmationEntity | ConfirmationI){
		try {
			return (await this.confirmationRepository.save(confirmation));
		} catch (error) {
			throw new Exception(Response.makeResponse(500, ErrorParser.parseDbSaveExeption(error)));
		}
	}
}