import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';

@Component({
  selector: 'app-left-nav',
  templateUrl: './left-nav.component.html',
  styleUrls: ['./left-nav.component.css']
})
export class LeftNavComponent implements OnInit {

  constructor(private sQuery: LocalStorageQueryService,
				private router: Router) { }

  ngOnInit(): void {
  }
  logOut(): void {
	var answer = window.confirm("Are you realy want to log out?");
	if (answer) {
		this.sQuery.removeUser();
		this.router.navigateByUrl('/auth');
	}
	else {
		console.log("answer2: ", answer);
	}
}

}
