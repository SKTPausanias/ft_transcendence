import { Component, Input, OnInit } from '@angular/core';
import { Nav } from 'src/app/shared/enums/eUser';


@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {
	@Input() path: string;
	nav = Nav;
	constructor() { }

	ngOnInit(): void {
		console.log("ngOnInit content url = : ", this.path);
	}
}