/// <reference lib="webworker" />

import { mDate } from "../utils/date";

function startWork(data: any, work: any)
{
	let counter = data.value - mDate.timeNowInSec();
	let intervalId = setInterval(() => {
		console.log(counter);
		if (counter-- <= 0)
		{
			postMessage(data);
			clearInterval(intervalId)
		}
	}, 1000)
}

function sessionHandler(data: any, work: any){
	data.value !== undefined ? startWork(data, work) : work(data);
}
function activityHandler(data: any, work: any){
	data.value !== undefined ? startWork(data, work) : work(data);
}

addEventListener('message', ({ data }) => {
	if (data.type == 'session-handler')
		sessionHandler(data, postMessage);
	else if (data.type = 'activity-handler')
		activityHandler(data, postMessage);
});


