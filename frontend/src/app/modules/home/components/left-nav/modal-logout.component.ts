import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'ngbd-modal-confirm',
	templateUrl: './modal-logout.component.html',
	styleUrls: ['./modal-logout.component.css'],
  })
  export class NgbdModalConfirm {
    constructor(public modal: NgbActiveModal,
                private sQuery: LocalStorageQueryService,
                private router: Router) {}
    close(result?: any): void {
          this.sQuery.removeUser();
          this.router.navigateByUrl('/auth');
          this.modal.close();
    }
  }