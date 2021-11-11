import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SessionI } from 'src/app/shared/ft_interfaces';
import { SocketService } from '../../socket.service';
import { wSocket } from 'src/app/shared/ft_enums';
import { ChannelI } from 'src/app/shared/interface/iChat';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient,
			        private socketService: SocketService) {}

  async searchUsers(session: SessionI, val: string): Promise<any> {
    const url = '/api/users/dashboard/search';
    var searchParams = new HttpParams().set('match', val);
    try{
    return (await this.http.get<any>(url, {headers: new HttpHeaders({
      Authorization: 'Bearer ' + session.token}),
    params : searchParams}).toPromise());
    }catch(e){
      return (e);
    }
  }
  liveSearchUsers(session: SessionI, val: string): any {
    const url = '/api/users/dashboard/search';
    var searchParams = new HttpParams().set('match', val);
    try{
		return (this.http.get<any>(url, {headers: new HttpHeaders({
			Authorization: 'Bearer ' + session.token}),
		params : searchParams}));
    }catch(e){
      return (e);
    }
  }
  async addFriendShip(user: any, session: SessionI): Promise<any> {
      const url = '/api/users/dashboard/addFriend';
      try{
        const ret = (await this.http.post<any>(url, user, { headers: new HttpHeaders({
            Authorization: 'Bearer ' + session.token
          })
        }).toPromise())
		if (ret && !ret.confirmed)
			this.socketService.emit(wSocket.FRIEND_INVITATION, user);
		if (ret && ret.confirmed){
			this.socketService.emit(wSocket.FRIEND_ACCEPT, user);
    }
		return (ret);
      } catch(e){
        return (e);
      }
  }

  async removeFriendShip(user: any, session: SessionI): Promise<any> {
    const url = '/api/users/dashboard/removeFriend';

    try{
      const ret = (await this.http.post<any>(url, user, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise())
	  this.socketService.emit(wSocket.FRIEND_DELETE, user);
	  return (ret);
    } catch(e){
      return (e);
    }
  }

  async createGroupChat(session: SessionI, groupInfo: any): Promise<any> {
    const url = '/api/users/chat/saveChatGroup';
    console.log("data from body: ", groupInfo);
    try{
      const ret = (await this.http.post<any>(url, groupInfo, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise())
    return (ret);
    } catch(e){
      return (e);
    }
  }

  async addChannel(session: SessionI, channelInfo: ChannelI): Promise<any> {
    const url = '/api/users/chat/saveChatGroup';
    console.log("data from body: ", channelInfo);
    try{
      const ret = (await this.http.post<any>(url, channelInfo, { headers: new HttpHeaders({
          Authorization: 'Bearer ' + session.token
        })
      }).toPromise())
    return (ret);
    } catch(e){
      return (e);
    }
  }
}
