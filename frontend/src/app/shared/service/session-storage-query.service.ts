import { Injectable } from '@angular/core';
import { Storage } from '../enums/eUser';
import { SessionStorageService } from './session-storage.service';

@Injectable({
providedIn: 'root',
})
export class SessionStorageQueryService {
	constructor(private sessionStorage: SessionStorageService) {}


	setSessionToken(session: any) {
		this.sessionStorage.set(Storage.SESSION_TOKEN, session);
	}
	getSessionToken(): any {
		const data = this.sessionStorage.get(Storage.SESSION_TOKEN);
		if (data)
			return data;
		return undefined;
	}
	removeSessionToken() {
		this.sessionStorage.remove(Storage.SESSION_TOKEN);
	}
	setUser(user: any) {
		this.sessionStorage.set(Storage.USER, user);
	}
	getUser(): any {
		const data = this.sessionStorage.get(Storage.USER);
		if (data)
			return data;
		return undefined;
	}
	removeUser() {
		this.sessionStorage.remove(Storage.USER);
	}
	setNavParam(navParam: any) {
		this.sessionStorage.set(Storage.NAV, navParam);
	}
	getNavParam(): any {
		const data = this.sessionStorage.get(Storage.NAV);
		if (data)
			return data;
		return undefined;
	}
	removeNavParam() {
		this.sessionStorage.remove(Storage.NAV);
	}
	removeAll(){
		this.removeUser();
		this.removeNavParam();
		this.removeSessionToken();
	}
}