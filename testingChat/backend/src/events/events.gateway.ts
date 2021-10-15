import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
  
interface friendI {id: any, status: Boolean};
var active = false;
@WebSocketGateway({ cors: true })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() server;
	async handleConnection(client) {
		console.log("Client conected: ", client.handshake.headers.authorization);
		if (client.handshake.headers.authorization.indexOf("AABBCC") < 0)
			this.handleDisconnect(client);
	}
	async handleDisconnect(client) {
		console.log("Client disconected: ", client.handshake.headers.authorization);
	}
	@SubscribeMessage('test')
	async handshake(client, message) {
		//Creamos 1 objeto general
		console.log("MSG From Client: [", client.handshake.headers.authorization, "] : ", message);
		this.server.emit('test', "this is what Server recived: " + message);
	
	}
}
/* 	@WebSocketServer() server;
	async handleConnection(client) {
	  // A client has connected
	  this.users++;
	  // Notify connected clients of current users
	 // console.log("connected new client : [ ", client.id, " ]");
	  this.friends.push({id:client.id, status: true});
	  this.server.emit('online', this.friends);
	  this.server.emit('users', this.users);
	  //console.log(client.headers.authorization);
	  console.log(client.handshake.headers.authorization);
	}
	async handleDisconnect(client) {
	  // A client has disconnected
	  this.users--;
	  // Notify connected clients of current users
	  //    this.departments = this.departments.filter(item => item != name);
		this.friends = this.friends.filter(item=> item.id != client.id);
		console.log(this.friends);
	  console.log("client disconected: [ ", client.id, " ]");

	  this.server.emit('users', this.users);
	}
	@SubscribeMessage('handshake')
	async handshake(client, message) {
		//Creamos 1 objeto general
		
		if (message == "AABBCC")
			this.server.emit('handshake', "SESSION OK");
		else
			this.server.emit('handshake', "SESSION OK");

		console.log("[MSG RECIVED] ", client.id, " : ", message);
		//console.log("message: ", message);
		this.server.emit('chat', message);
	  //client.broadcast.emit('chat', message);
	
	}
	@SubscribeMessage('chat')
	async onChat(client, message) {
		console.log("[MSG RECIVED] ", client.id, " : ", message);
		//console.log("message: ", message);
		this.server.emit('chat', message);
	  //client.broadcast.emit('chat', message);
	
	}
	@SubscribeMessage('chatOneToOne')
	async chatOneToOne(client, data: any)
	{
		console.log("Starting chat with: ", data);
		if (data.pwd == 123)
			this.server.emit('chatOneToOne', "OK")
		else
			this.server.emit('chatOneToOne', "FAIL")
	}

  } */

  /*
			User: -> de DB
			SOCKET ID: client.id
			chat: [
				{id, participants[], pwd}
			]
			game: { player 1, player 2
				live: {viewers : [
					{viewer1 by id},
					{viewer2 by id}
				]}
			}
			friends: [{}]
		*/