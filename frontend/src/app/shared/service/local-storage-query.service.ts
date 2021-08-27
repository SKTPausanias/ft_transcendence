import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { Storage } from 'src/app/shared/enums/eUser';


@Injectable({
  providedIn: 'root'
})
export class LocalStorageQueryService {

  constructor(private localStorageService : LocalStorageService) {
  }

  getStatus(): any {
    const data = this.localStorageService.get(Storage.STATUS);
    if (data) 
      return data.status;
    return null;
  }

  setStatus(statusValue : number) {
    this.localStorageService.set(Storage.STATUS, { status: statusValue });
  }

  removeStatus(): void {
    this.localStorageService.remove(Storage.STATUS);
  }
}
