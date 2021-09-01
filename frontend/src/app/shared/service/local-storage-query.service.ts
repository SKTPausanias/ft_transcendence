import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { Storage } from 'src/app/shared/enums/eUser';
import { UserI } from '../interface/user';

@Injectable({
providedIn: 'root',
})
export class LocalStorageQueryService {
	constructor(private localStorageService: LocalStorageService) {}

	setUser(user: UserI) {
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
