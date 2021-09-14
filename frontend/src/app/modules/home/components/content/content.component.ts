import { Component, Input, OnInit } from '@angular/core';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {

	@Input() fragment: number;
  	constructor(private sQuery: LocalStorageQueryService) { }

  ngOnInit(): void {
	  console.log("ngOnInit content");
  }

}

/*
1. info component
2. game component
3. live component
4. chat component
5. settings component

*/