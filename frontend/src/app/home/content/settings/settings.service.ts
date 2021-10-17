import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserInfoI, SessionI } from 'src/app/shared/ft_interfaces';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { mDate } from 'src/app/utils/date';

@Injectable({
providedIn: 'root',
})
export class SettingsService {

	user: UserInfoI = <UserInfoI>{};

	constructor(
		private http: HttpClient,
		private sQuery: SessionStorageQueryService
	) {}

	async deleteUserAccount(session: SessionI): Promise<any> {
		const url = '/api/users/settings/delete';
		const response = await this.http.get<any>(url, {headers: new HttpHeaders({
			Authorization: 'Bearer ' + session.token})}).toPromise();
		return (response);
	}

	async updateUser(userData: UserInfoI, session: SessionI): Promise<any>
	{
		const url = '/api/users/settings/update';
		try{
			const ret =  (await this.http.post<any>(url, userData, {headers: new HttpHeaders({
				Authorization: 'Bearer ' + session.token})}).toPromise());
			return (ret);
		}
		catch(e){
			return e;
		}
	}

	 async uploadImage(image: File, fileName: string, session: SessionI): Promise<any> {
		const url = 'api/users/settings/imageUpload';
		const body = new FormData();
        body.append('image', image, (fileName  + mDate.timeNowInSec() + image.name.substring(image.name.indexOf('.'))));
		try{
			return (await this.http.post(url, body, 
				{ headers: new HttpHeaders({
					Authorization: 'Bearer ' + session.token})
			}).toPromise());
		}catch(e){
			console.log("from catch: ", e);
		}
		return (false);
	  }
	async sendCode(session: SessionI){
		const url = 'api/users/settings/sendcode';
		const response = await this.http.get<any>(url, {headers: new HttpHeaders({
			Authorization: 'Bearer ' + session.token})}).toPromise();
		return (response);
	}
	async showQrCode(session: SessionI, code: number){
		const url = 'api/users/settings/show-qr';
		const response = await this.http.post<any>(url, {code}, {headers: new HttpHeaders({
			Authorization: 'Bearer ' + session.token})}).toPromise();
		return (response);
	}
	/*async logoutUser(){
		const id = this.sQuery.getUser().id;
		const url = '/api/logout';
		await this.http.get<any>(url + '?id=' + id).toPromise();
	}*/
}
