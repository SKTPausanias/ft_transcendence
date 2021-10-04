import { SessionEntity } from "./session.entity";
import { SessionInfoI } from "./sessionI";

export class Session {
	static getSesionToken(session: SessionEntity)
	{
		return (<SessionInfoI>{
			token: session.token,
			expiration_time: session.expiration_time
		})
	}
}