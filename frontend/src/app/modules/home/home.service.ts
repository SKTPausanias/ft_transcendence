import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserI } from 'src/app/shared/interface/user';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';

@Injectable({
providedIn: 'root',
})
export class HomeService {
	userId: number = this.sQuery.getUser().id;

	constructor(
		private http: HttpClient,
		private sQuery: LocalStorageQueryService
	) {}

	async getUserData(): Promise<UserI> {
		if (this.userId === undefined) return <UserI>{};
		const url = '/api/user/data';
		const response = await this.http
		.get<any>(url + '?id=' + this.userId)
		.toPromise();
		return response ? response : <UserI>{};
	}
}
