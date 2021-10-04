import { ResponseI } from "../response/responseI";

export class Exception extends Error {
	statusCode: number;
	data: any;
	constructor(response: ResponseI)
	{
		super();
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, Exception)
		  }
		this.statusCode = response.statusCode;
		this.data = response.data;
	}
}