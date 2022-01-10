import { DatePipe } from "@angular/common";
import { MessagesI } from "../interface/iChat";
import { UserPublicInfoI } from "../interface/iUserInfo";

export class Messages implements MessagesI{

    message: string;
    date: number;
    msgDateString: string; //Date(timestamp * 1000).toLocaleString().pipe(yyyy,mm,dd);
    user: UserPublicInfoI;
    owner: string = "";

    constructor(){
        this.user = <UserPublicInfoI>{};
        //TODO: from interface to retrieve data from backend on getMessages 
    }
    setMessage(value: any)
    {
        this.message = value.message;
        this.msgDateString = new Date(value.date * 1000).toString();
        this.msgDateString = this.msgDateString.substring(0, this.msgDateString.indexOf("GMT"));
        //remove seconds from date
        this.msgDateString = this.msgDateString.substring(0, this.msgDateString.lastIndexOf(":"));
        // remove weekday from date
        this.msgDateString = this.msgDateString.substring(this.msgDateString.indexOf(",") + 4);
        console.log(this.msgDateString);
        this.date = value.date;
        this.user = value.user;
        this.owner = value.owner;
    }
}