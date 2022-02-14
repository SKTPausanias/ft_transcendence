import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { SharedPreferencesI } from "src/app/shared/ft_interfaces";
import { UserInfoI } from "src/app/shared/interface/iUserInfo";

@Component({
    selector: 'app-reuslt-modal',
    templateUrl: './result-modal.component.html',
    styleUrls: ['./result-modal.component.css']
})
export class ResultModalComponent implements OnInit {
  showForm: boolean;
  message: string;
  preferences: SharedPreferencesI
  user: UserInfoI;
  victories: string;
  defeats: string;
  constructor(private modal: NgbActiveModal,){
   
  }
  ngOnInit(): void {
    this.user = this.preferences.userInfo
  }

  ngOnDestroy(): void {}

	openForm(){
        this.showForm = true;
	}

  close() {
		this.modal.dismiss();
	}
}
  