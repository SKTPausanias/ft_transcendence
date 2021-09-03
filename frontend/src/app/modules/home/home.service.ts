import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserI } from 'src/app/shared/interface/user';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';

@Injectable({
providedIn: 'root',
})
export class HomeService {

	constructor(
		private http: HttpClient,
		private sQuery: LocalStorageQueryService
	) {}

	async getUserData(): Promise<UserI> {
		const id = this.sQuery.getUser().id;
		console.log("calling backend: ", id);
		if (id === undefined)
			return <UserI>{};
		const url = '/api/user/data';
		const response = await this.http.get<any>(url + '?id=' + id).toPromise();
		return response ? response : <UserI>{};
	}

	async deleteUserAccount(): Promise<any> {
		const id = this.sQuery.getUser().id;
		console.log("Deleting user calling the backend controller: ", id);
		if (id === undefined)
			return <UserI>{};
		const url = '/api/user/delete';
		const response = await this.http.get<any>(url + '?id=' + id).toPromise();
		return (response);
	}
}
