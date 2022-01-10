import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {

	sessionStorage: Storage;
	sessionStorageData: any;
	constructor() {
	  this.sessionStorage = window.sessionStorage;
	}
	get(key: string): any {
	  if (this.isSessionStorageSupported) {
		this.sessionStorageData = this.sessionStorage.getItem(key);
		return JSON.parse(this.sessionStorageData);
	  }
	  return null;
	}
	set(key: string, value: any): boolean {
	  if (this.isSessionStorageSupported) {
		this.sessionStorage.setItem(key, JSON.stringify(value));
		return true;
	  }
	  return false;
	}
	remove(key: string): boolean {
	  if (this.isSessionStorageSupported) {
		this.sessionStorage.removeItem(key);
		return true;
	  }
	  return false;
	}
	get isSessionStorageSupported(): boolean {
	  return !!this.sessionStorage
	}
}
