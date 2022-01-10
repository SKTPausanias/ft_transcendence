import { Component, OnInit } from "@angular/core";
import { LiveService } from "./live.service";

@Component({
	selector: "app-live",
	templateUrl: "./live.component.html",
	styleUrls: ["./live.component.css"],
})
export class LiveComponent implements OnInit {
	liveEventReciver: any;

	constructor(private liveService: LiveService) {}

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
