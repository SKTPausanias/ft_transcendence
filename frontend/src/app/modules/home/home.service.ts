import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { bottom } from '@popperjs/core';
import { UserI } from 'src/app/shared/interface/user';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';

@Injectable({
providedIn: 'root',
})
export class HomeService {

	user: UserI = <UserI>{};

	constructor(
		private http: HttpClient,
		private sQuery: LocalStorageQueryService
	) {}

	async getUserData(): Promise<UserI> {
		const id = this.sQuery.getUser().id;
		if (id === undefined)
			return <UserI>{};
		const url = '/api/user/data';
		const response = await this.http.get<any>(url + '?id=' + id).toPromise();
		return response ? response : <UserI>{};
	}

	async deleteUserAccount(): Promise<any> {
		const id = this.sQuery.getUser().id;
		if (id === undefined)
			return <UserI>{};
		const url = '/api/user/delete';
		const response = await this.http.get<any>(url + '?id=' + id).toPromise();
		return (response);
	}

	async updateUser(userData: UserI): Promise<UserI>
	{
		const url = '/api/user/updateUser';
		var ok = false;
		try{
			ok = await this.http.post<any>(url, userData).toPromise();
		}catch(e){
			console.log("Error from catch: ", e);
		}
		console.log("User: ", ok);
		return (this.user);
	}
	async logoutUser(){
		const id = this.sQuery.getUser().id;
		const url = '/api/logout';
		await this.http.get<any>(url + '?id=' + id).toPromise();
	}
}
