import { ResponseI } from "./responseI";

export class Response{

	static makeResponse(statusCode: number, data: any): ResponseI{
		let response: ResponseI = <ResponseI>{};
		response.statusCode = statusCode;
		response.data = data;
		return (response);
	}
}