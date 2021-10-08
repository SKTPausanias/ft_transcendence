import { Component, Input, OnInit } from '@angular/core';
import { Nav } from 'src/app/shared/ft_enums';
import { SharedPreferencesI, UserInfoI } from 'src/app/shared/ft_interfaces';


@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.css']
})
export class ContentComponent implements OnInit {
	@Input() path: string;
	@Input() contentPreference: SharedPreferencesI;

	nav = Nav;
	constructor() { 
	}

	ngOnInit(): void {
	}
}