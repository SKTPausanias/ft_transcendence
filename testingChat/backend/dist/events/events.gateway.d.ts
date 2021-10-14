import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: any;
    handleConnection(client: any): Promise<void>;
    handleDisconnect(client: any): Promise<void>;
    handshake(client: any, message: any): Promise<void>;
}
