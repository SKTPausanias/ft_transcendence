import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'ngbd-modal-confirm',
    template: `
    <div class="modal-header">
      <h4 class="modal-title" id="modal-title">PONG LogOut</h4>
      <button type="button" class="close" aria-describedby="modal-title" (click)="modal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <p><strong>Are you sure you want to logout?</strong></p>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-secondary" (click)="modal.dismiss('cancel click')">Cancel</button>
      <button type="button" class="btn btn-danger" (click)="close('LogOut click')">LogOut</button>
    </div>
    `
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