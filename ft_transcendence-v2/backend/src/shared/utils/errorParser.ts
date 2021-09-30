export class ErrorParser{

	static parseDbSaveExeption(err: any){
		let e = err.detail;
		let msg;
		let pos1;
		let pos2;
		pos1 = e.indexOf("(");
		pos2 = e.indexOf(")"); 
		msg = e.substring(pos1 + 1, pos2) + ' ';
		e = e.substring(pos2 + 1, e.length);
		pos1 = e.indexOf("(");
		pos2 = e.indexOf(")"); 
		msg  += e.substring(pos1 + 1, pos2);
		msg += e.substring(pos2 + 1, e.length);
		return (msg)
	}
}