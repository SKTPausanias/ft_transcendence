import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { HomeService } from '../../home.service';

@Component({
    selector: 'ngbd-modal-confirm',
	templateUrl: './modal-logout.component.html',
	styleUrls: ['./modal-logout.component.css'],
  })
  export class NgbdModalConfirm {
    constructor(public modal: NgbActiveModal,
                private sQuery: LocalStorageQueryService,
                private router: Router,
				private homeService: HomeService) {}
    async close(result?: any): Promise<void> {
		console.log("close1");
		await this.homeService.logoutUser();
		console.log("close2");
		this.sQuery.removeUser();
		this.router.navigateByUrl('/auth');
		this.modal.close();
    }
  }