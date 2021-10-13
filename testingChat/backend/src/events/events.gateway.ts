import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	OnGatewayConnection,
	OnGatewayDisconnect,
  } from '@nestjs/websockets';
  @WebSocketGateway({ cors: true })
  export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server;
	users: number = 0;
	async handleConnection(client) {
	  // A client has connected
	  this.users++;
	  // Notify connected clients of current users
	  console.log("connected new client : [ ", client.id, " ]");
	  this.server.emit('users', this.users);
	}
	async handleDisconnect(client) {
	  // A client has disconnected
	  this.users--;
	  // Notify connected clients of current users	  
	  console.log("client disconected: [ ", client.id, " ]");

	  this.server.emit('users', this.users);
	}
	@SubscribeMessage('chat')
	async onChat(client, message) {
		console.log("[MSG RECIVED] ", client.id, " : ", message);
		//console.log("message: ", message);
		this.server.emit('chat', message);
	  client.broadcast.emit('chat', message);
	}
  }