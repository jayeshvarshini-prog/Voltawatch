import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, WebSocket } from 'ws';
import { GraphQLClientService } from '../graphql-client/graphql-client.service';
import { gql } from '@apollo/client/core';

interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  subscribedCars?: Set<string>;
}

const UPSERT_READING_MUTATION = gql`
  mutation UpsertReading($input: CreateTelemetryInput!) {
    upsertReading(input: $input) {
      id
      carId
      timestamp
      batteryVoltage
      batteryPercentage
      batteryTempCelsius
      motorTempCelsius
      rpm
      cabinTempCelsius
      currentMileage
      speedKmh
      latitude
      longitude
      faultCodes
      isCharging
      chargingPowerKw
    }
  }
`;

@WebSocketGateway({ path: '/ws/telemetry' })
export class TelemetryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(TelemetryGateway.name);
  private clients = new Map<WebSocket, AuthenticatedSocket>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly graphqlClient: GraphQLClientService,
  ) {}

  handleConnection(client: AuthenticatedSocket) {
    this.logger.log('WebSocket client attempting connection');
    client.subscribedCars = new Set();
    this.clients.set(client, client);

    client.on('message', (raw: Buffer) => {
      try {
        const message = JSON.parse(raw.toString());
        if (message.event === 'auth') {
          this.handleAuth(client, message.data);
        }
      } catch {
        // ignore non-JSON
      }
    });
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`WebSocket client disconnected: ${client.userId || 'unauthenticated'}`);
    this.clients.delete(client);
  }

  private handleAuth(client: AuthenticatedSocket, data: { token: string }) {
    try {
      const payload = this.jwtService.verify(data.token);
      client.userId = payload.sub;
      client.send(JSON.stringify({ event: 'auth', data: { status: 'authenticated' } }));
      this.logger.log(`WebSocket client authenticated: ${payload.sub}`);
    } catch {
      client.send(
        JSON.stringify({ event: 'auth', data: { status: 'error', message: 'Invalid token' } }),
      );
      client.close();
    }
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { carId: string },
  ) {
    if (!client.userId) {
      return { event: 'error', data: { message: 'Not authenticated' } };
    }
    client.subscribedCars?.add(data.carId);
    this.logger.log(`Client ${client.userId} subscribed to car ${data.carId}`);
    return { event: 'subscribed', data: { carId: data.carId } };
  }

  @SubscribeMessage('telemetry')
  async handleTelemetry(@ConnectedSocket() client: AuthenticatedSocket, @MessageBody() data: any) {
    if (!client.userId) {
      return { event: 'error', data: { message: 'Not authenticated' } };
    }

    try {
      const result = await this.graphqlClient.mutateWithAuth(
        UPSERT_READING_MUTATION,
        { input: data },
        '', // WS doesn't need token for backend since we've already authenticated
      );

      // Broadcast to all subscribed clients
      this.broadcastToSubscribers(data.carId, result.upsertReading);

      return { event: 'telemetry_ack', data: { status: 'ok' } };
    } catch (err) {
      this.logger.error('WebSocket telemetry ingestion failed', err);
      return { event: 'error', data: { message: 'Ingestion failed' } };
    }
  }

  broadcastToSubscribers(carId: string, telemetry: any) {
    for (const [, client] of this.clients) {
      if (client.subscribedCars?.has(carId) && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event: 'telemetry_update', data: telemetry }));
      }
    }
  }
}
