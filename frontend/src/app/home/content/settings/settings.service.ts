import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserInfoI, SessionI } from 'src/app/shared/ft_interfaces';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';

@Injectable({
providedIn: 'root',
})
export class SettingsService {

	user: UserInfoI = <UserInfoI>{};

	constructor(
		private http: HttpClient,
		private sQuery: SessionStorageQueryService
	) {}

  async getUserInfo(session: SessionI): Promise<any>
  {
    const url = '/api/users/userInfo';
    const response = await this.http.get<any>(url,{ headers : new HttpHeaders({
      Authorization: 'Bearer ' + session.token})}).toPromise();
    return (response);
  }

	async getUserData(): Promise<UserInfoI> {
		const id = this.sQuery.getUser().id;
		if (id === undefined)
			return <UserInfoI>{};
		const url = '/api/user/data';
		const response = "";//await this.http.get<any>(url + '?id=' + id).toPromise();
		return response ? response : <UserInfoI>{};
	}

	async deleteUserAccount(): Promise<any> {
		const id = this.sQuery.getUser().id;
		if (id === undefined)
			return <UserInfoI>{};
		const url = '/api/user/delete';
		const response = "";//await this.http.get<any>(url + '?id=' + id).toPromise();
		return (response);
	}

	async updateUser(userData: UserInfoI): Promise<any>
	{
		const url = '/api/user/updateUser';

		try{
			return "";//(await this.http.post<any>(url, userData).toPromise());
		}
		catch(e){
			return e;
		}
	}

	 async uploadImage(image: File, fileName: string): Promise<any> {
		const url = '/api/user/imageUpload';
		const body = new FormData();

        body.append('image', image, (fileName + image.name.substring(image.name.indexOf('.'))));
		
		try{
			return "";//(await this.http.post(url, body, {responseType: "text"}).toPromise());
		}catch(e){
			console.log("from catch: ", e);
		}
		return (false);
	  }

	/*async logoutUser(){
		const id = this.sQuery.getUser().id;
		const url = '/api/logout';
		await this.http.get<any>(url + '?id=' + id).toPromise();
	}*/
}
