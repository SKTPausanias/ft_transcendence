import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: any;
    users: number;
    handleConnection(client: any): Promise<void>;
    handleDisconnect(client: any): Promise<void>;
    onChat(client: any, message: any): Promise<void>;
}
