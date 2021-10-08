export class mDate{

	static timeNowInSec(){
		return (Math.round(Date.now() / 1000))
	}
	static setExpirationTime(expires_in: number){
		return (this,this.timeNowInSec() + expires_in);
	}
	static expired(limit: number){
		return (this.timeNowInSec() >= limit ? true : false);
	}
}