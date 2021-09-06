import { Component, OnInit } from '@angular/core';
import { UserI } from 'src/app/shared/interface/user';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';

@Component({
  selector: 'app-right-nav',
  templateUrl: './right-nav.component.html',
  styleUrls: ['./right-nav.component.css']
})
export class RightNavComponent implements OnInit {

  user: UserI = this.sQuery.getUser();
  constructor(private sQuery: LocalStorageQueryService) { }

  ngOnInit(): void {
  }

}
