import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/auth/auth.service';
import { SessionStorageQueryService } from '../../../shared/service/session-storage-query.service';

@Component({
    selector: 'ngbd-modal-confirm',
	templateUrl: './logout-modal.component.html',
	styleUrls: ['./logout-modal.component.css'],
  })
  export class NgbdModalConfirm {
    constructor(public modal: NgbActiveModal,
                private sQuery: SessionStorageQueryService,
                private router: Router,
				private authService: AuthService) {}
    async close(result?: any): Promise<void> {
		const resp = await this.authService.logout(this.sQuery.getSessionToken());
		console.log(resp);
		this.sQuery.removeAll();
		this.router.navigateByUrl('logIn');
		this.modal.close();

    }
  }