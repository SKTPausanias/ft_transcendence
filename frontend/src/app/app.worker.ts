/// <reference lib="webworker" />

import { mDate } from "./utils/date";


addEventListener('message', ({ data }) => {
	var counter: number;
	if (data == 'init')
		postMessage("OK");
	else if (data =='stop')
		counter = 1;
	else
	{
		counter = data - mDate.timeNowInSec();
		let intervalId = setInterval(() => {
			if (counter-- <= 0)
			{
				postMessage("finished");
				clearInterval(intervalId)
			}
		}, 1000)
	}
});
