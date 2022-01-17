import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { SharedPreferencesI } from "src/app/shared/ft_interfaces";
import { LiveService } from "./live.service";

@Component({
	selector: "app-live",
	templateUrl: "./live.component.html",
	styleUrls: ["./live.component.css"],
})
export class LiveComponent implements OnInit {
	@Input() livePreference: SharedPreferencesI;
	liveEventReciver: any;

	constructor(private liveService: LiveService,
				private router: Router) {}

	ngOnInit(): void {
		this.initLiveEventReciver();
	}
	ngOnDestroy(): void {
		this.liveEventReciver.unsubscribe();
	}
	initLiveEventReciver(){
		this.liveEventReciver = this.liveService.liveEventEmitter.subscribe((data : any )=>{
			console.log("data from live service recived: ", data);
		})
	}
}
