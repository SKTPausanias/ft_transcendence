import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

	localStorage: Storage;
	localStorageData: any;
	constructor() {
	  this.localStorage = window.localStorage;
	}
	get(key: string): any {
	  if (this.isLocalStorageSupported) {
		this.localStorageData = this.localStorage.getItem(key);
		return JSON.parse(this.localStorageData);
	  }
	  return null;
	}
	set(key: string, value: any): boolean {
		console.log(key, typeof(key));
		console.log(value, typeof(value));
	  if (this.isLocalStorageSupported) {
		this.localStorage.setItem(key, JSON.stringify(value));
		return true;
	  }
	  return false;
	}
	remove(key: string): boolean {
	  if (this.isLocalStorageSupported) {
		this.localStorage.removeItem(key);
		return true;
	  }
	  return false;
	}
	get isLocalStorageSupported(): boolean {
	  return !!this.localStorage
	}
}
