import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer'

@Injectable()
export class MailService {
	sender = process.env.MAIL_SENDER;
	transporter;
	constructor(){
	 this.transporter = nodemailer.createTransport({
		host: process.env.MAIL_HOST,
		port: process.env.MAIL_PORT,
		auth: {
		  user: process.env.MAIL_USER,
		  pass: process.env.MAIL_PASS,
		},
	  });
	}

	sendConfirmation(to: string, code:string)
	{
		const url = process.env.FE_URL + "/confirmation?code="+ code + "&email=" + to;
		const content =	{
			from: this.sender,
			to: to,
			subject: "✔[PONG] Confirmation",
			text: "Click this link to complelte!",
			html: "<b>Click this link to complelte!</b><a href='" + url + "'>confirm your account</a>", // html body
		}
		console.log("skipping confirm email send: ", url);
		//this.send(content);
	}
	sendValidationCode(to: string, code:string)
	{
		const content =	{
			from: this.sender,
			to: to,
			subject: "✔[PONG] Code Validation",
			text: "Click this link to complelte!",
			html: "<h4> Here is your code <h3>" + code + "</h3></h4>", // html body
		}
		console.log("skipping two factor email send: ", code);
		//this.send(content);
	}
	private send(content: {})
	{
		this.transporter.sendMail(content).then(info => {
			console.log({info});
		}).catch(console.error);
	}

}
