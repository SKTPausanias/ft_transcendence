import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { Storage } from 'src/app/shared/enums/eUser';
import { UserI } from '../interface/user';
import { SessionTokenI } from '../interface/iSessionToken'

@Injectable({
providedIn: 'root',
})
export class LocalStorageQueryService {
	constructor(private localStorageService: LocalStorageService) {}

	setSessionToken(value: SessionTokenI)
	{
		this.localStorageService.set(Storage.SESSION_TOKEN, value);	
	}
	getSessionToken(): SessionTokenI {
		const data = this.localStorageService.get(Storage.SESSION_TOKEN);
		return (data ? data : <SessionTokenI>{});
	}
	removeSessionToken() {
		this.localStorageService.remove(Storage.SESSION_TOKEN);
	}

	setUser(user: UserI) {
		console.log("setUser localStorage: ", user);
		this.localStorageService.set(Storage.USER, user);
	}
	getUser(): UserI {
		const data = this.localStorageService.get(Storage.USER);
		if (data)
			return data;
		return <UserI>{};
	}
	removeUser() {
		this.localStorageService.remove(Storage.USER);
	}
}
// http://localhost:3000/api/user/data?token=72
// backend 72 -> ab (encoded to decoded)
// ab (decoded) -> tabla de session = id -> tabla usuario



// A <| !there is no validation |> B