import { Component, Input, OnInit } from '@angular/core';
import { RightNavI } from 'src/app/shared/interface/rightNav';
import { UserI } from 'src/app/shared/interface/user';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';

@Component({
  selector: 'app-right-nav',
  templateUrl: './right-nav.component.html',
  styleUrls: ['./right-nav.component.css']
})
export class RightNavComponent implements OnInit {
	@Input() item: RightNavI;

  constructor(private sQuery: LocalStorageQueryService) {
	  
   }

  ngOnInit(): void {
  }

}
