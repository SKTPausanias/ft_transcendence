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
		this.send(content);
	}
	private send(content: {})
	{
		this.transporter.sendMail(content).then(info => {
			console.log({info});
		}).catch(console.error);
	}

}
