import { MessagesI } from "../interface/iChat";
import { UserPublicInfoI } from "../interface/iUserInfo";

export class Messages implements MessagesI{

    message: string;
    date: number;
    msgDateString: string; //Date(timestamp * 1000).toLocaleString().pipe(yyyy,mm,dd);
    friend: UserPublicInfoI;

    constructor(value: any){
        this.message = value.message;
        this.msgDateString = new Date(value.date * 1000).toString();
        //TODO: from interface to retrieve data from backend on getMessages 
    }
}