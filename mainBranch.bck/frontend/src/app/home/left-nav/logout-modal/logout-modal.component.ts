import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/auth/auth.service';
import { SessionStorageQueryService } from 'src/app/shared/ft_services';
import { HomeService } from '../../home.service';
import { SocketService } from '../../socket.service';

@Component({
    selector: 'ngbd-modal-confirm',
	templateUrl: './logout-modal.component.html',
	styleUrls: ['./logout-modal.component.css'],
  })
  export class NgbdModalConfirm {
    constructor(public modal: NgbActiveModal,
				private homeService: HomeService) {}
    async close(result?: any): Promise<void> {
		await this.homeService.closeSession();
		this.modal.close();

    }
  }