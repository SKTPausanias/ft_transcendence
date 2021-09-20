
export interface SessionTokenI{
	// sesion token: {
		session_token: String,
		creation_time: number,
		expires_in: number,
		session_status: number

		// token: String -> encoded 
		//  status: String -> 1,2,3
		//  creation_time: ->
		//  expires_in: -> 
		//-------------
		//Only in postgress
		// 42 api authorization header: string
		// expiration_time: number
		// id: number
		//}
		//if !session token || session token expired
		//	go to auth
		//else
		//	call backend

}