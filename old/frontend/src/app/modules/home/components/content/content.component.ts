import { Component, Input, OnInit } from '@angular/core';
import { Nav } from 'src/app/shared/enums/eUser';
import { LocalStorageQueryService } from 'src/app/shared/service/local-storage-query.service';


@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {
	@Input() path: string;
	nav = Nav;
	constructor(private sQuery: LocalStorageQueryService) { }

	ngOnInit(): void {
		console.log("ngOnInit content url = : ", this.path);
	}
}