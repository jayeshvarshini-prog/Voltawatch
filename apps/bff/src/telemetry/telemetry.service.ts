import { Injectable } from '@nestjs/common';
import { GraphQLClientService } from '../graphql-client/graphql-client.service';
import { gql } from '@apollo/client/core';

const GET_TELEMETRY_QUERY = gql`
  query GetTelemetry($carId: String!, $limit: Float!) {
    telemetry(carId: $carId, limit: $limit) {
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

const GET_LATEST_READING_QUERY = gql`
  query GetLatestReading($carId: String!) {
    latestReading(carId: $carId) {
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

const BATCH_UPSERT_MUTATION = gql`
  mutation BatchUpsertReadings($input: BatchTelemetryInput!) {
    batchUpsertReadings(input: $input) {
      accepted
      rejected
      errors {
        index
        message
      }
    }
  }
`;

@Injectable()
export class TelemetryService {
  constructor(private readonly graphqlClient: GraphQLClientService) {}

  async getTelemetry(carId: string, limit: number) {
    const data = await this.graphqlClient.query(GET_TELEMETRY_QUERY, { carId, limit });
    return data.telemetry;
  }

  async getLatestReading(carId: string) {
    const data = await this.graphqlClient.query(GET_LATEST_READING_QUERY, { carId });
    return data.latestReading;
  }

  async upsertReading(input: any, token: string) {
    const data = await this.graphqlClient.mutateWithAuth(
      UPSERT_READING_MUTATION,
      { input },
      token,
    );
    return data.upsertReading;
  }

  async batchUpsertReadings(readings: any[], token: string) {
    const data = await this.graphqlClient.mutateWithAuth(
      BATCH_UPSERT_MUTATION,
      { input: { readings } },
      token,
    );
    return data.batchUpsertReadings;
  }
}
