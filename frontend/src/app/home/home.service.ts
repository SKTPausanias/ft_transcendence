import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { AuthService } from "../auth/auth.service";
import { eChat, ePlay, wSocket } from "../shared/ft_enums";
import { SessionStorageQueryService } from "../shared/ft_services";
import { mDate } from "../utils/date";
import { PlayService } from "./content/play/play.service";
import { SocketService } from "./socket.service";

@Injectable({
providedIn: "root",
})
export class HomeService {
	session = this.sQuery.getSessionToken();
	sessionWorker: Worker;
	flag: boolean;
	expiresWorkerFlag: boolean;
	activityExpires: number | undefined = mDate.timeNowInSec() + environment.inactivity_time;
	constructor(private sQuery: SessionStorageQueryService,
				private authService: AuthService,
				private router: Router, 
				private socketService: SocketService,
				private playService: PlayService) {}
	async closeSession(){
		await this.playService.emit(ePlay.ON_CANCEL_MATCH_MAKING);
		await this.socketService.emit(wSocket.DISCONNECT_USER);
		//this.socketService.disconnect();
		this.terminateWorker();
		//await this.authService.logout(this.session);
		this.sQuery.removeAll();
		this.router.navigateByUrl("logIn");
	}
	listenSessionWorker(){
		 if (this.sessionWorker !== undefined)
		 	this.terminateWorker();
		this.sessionWorker = new Worker(
				new URL("src/app/home/home.worker", import.meta.url));
		this.sessionWorker.onmessage = async ({ data }) => {
			if (data.type == 'session-handler')
				await this.sessionHandler(data);
			if (data.type == 'activity-handler')
				await this.activityHandler(data);
			
		};
		this.sessionWorker.postMessage({type : "session-handler"});
		this.sessionWorker.postMessage({type : 'activity-handler'});
	}

	async sessionHandler(data: any){
		if ((this.session = this.sQuery.getSessionToken()) !== undefined)
		{
			if (mDate.expired(this.session.expiration_time))
			{
				const resp = await this.authService.checkSession(this.session);
				if (resp.statusCode == 200)
				{
					this.session.expiration_time = resp.data.expiration_time;
					this.sQuery.setSessionToken(this.session);
					this.sessionWorker.postMessage({type : 'session-handler', value : this.session.expiration_time});
				}
				else
					this.closeSession();
			}
			else
				this.sessionWorker.postMessage({type : 'session-handler', value : this.session.expiration_time});
		}
	}
	async activityHandler(data: any){
		if (this.activityExpires === undefined)
			this.activityExpires = mDate.timeNowInSec() + environment.inactivity_time;
		if (mDate.expired(this.activityExpires))
			this.closeSession();
		else
			this.sessionWorker.postMessage({type : 'activity-handler', value : (this.activityExpires)});
	}			
	async listenActivity(){
		this.activityExpires = mDate.timeNowInSec() + environment.inactivity_time;
		this.session = this.sQuery.getSessionToken();
		var margin = environment.renew_session_margin;
		if (this.session !== undefined)
		{
			if (mDate.expired(this.session.expiration_time))
			{
				this.authService.logout(this.session);
				this.sQuery.removeAll();
				this.router.navigateByUrl('logIn');
			}
			else if (this.session.expiration_time - mDate.timeNowInSec() <= margin && !this.flag)
			{
				this.flag = true;
				const resp = await this.authService.renewSession(this.session);
				if (resp.statusCode == 200)
				{
					this.session.expiration_time = resp.data.expiration_time;
					this.sQuery.setSessionToken(this.session);
					this.flag = false;
				}
			}
		}
	}
	async terminateWorker()
	{
		if (this.sessionWorker !== undefined)
		{
			this.sessionWorker.terminate();
			this.activityExpires = undefined;
		}
	}
}
