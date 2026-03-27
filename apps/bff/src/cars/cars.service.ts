import { Injectable } from '@nestjs/common';
import { GraphQLClientService } from '../graphql-client/graphql-client.service';
import { gql } from '@apollo/client/core';

const GET_CARS_QUERY = gql`
  query GetCars {
    cars {
      id
      vin
      model
      year
      currentMileage
      batteryHealthPercentage
      estimatedRangeKm
      lastServiceDate
    }
  }
`;

const GET_CAR_QUERY = gql`
  query GetCar($id: String!) {
    car(id: $id) {
      id
      vin
      model
      year
      currentMileage
      batteryHealthPercentage
      estimatedRangeKm
      lastServiceDate
      createdAt
      updatedAt
    }
  }
`;

const REGISTER_CAR_MUTATION = gql`
  mutation RegisterCar($input: CreateCarInput!) {
    registerCar(input: $input) {
      id
      vin
      model
      year
      currentMileage
      batteryHealthPercentage
      estimatedRangeKm
    }
  }
`;

const UPDATE_CAR_MUTATION = gql`
  mutation UpdateCar($id: String!, $input: UpdateCarInput!) {
    updateCar(id: $id, input: $input) {
      id
      vin
      model
      year
      currentMileage
      batteryHealthPercentage
      estimatedRangeKm
      lastServiceDate
    }
  }
`;

const DELETE_CAR_MUTATION = gql`
  mutation DeleteCar($id: String!) {
    deleteCar(id: $id)
  }
`;

@Injectable()
export class CarsService {
  constructor(private readonly graphqlClient: GraphQLClientService) {}

  async getAllCars() {
    const data = await this.graphqlClient.query(GET_CARS_QUERY);
    return data.cars;
  }

  async getCar(id: string) {
    const data = await this.graphqlClient.query(GET_CAR_QUERY, { id });
    return data.car;
  }

  async createCar(input: any, token: string) {
    const data = await this.graphqlClient.mutateWithAuth(REGISTER_CAR_MUTATION, { input }, token);
    return data.registerCar;
  }

  async updateCar(id: string, input: any, token: string) {
    const data = await this.graphqlClient.mutateWithAuth(UPDATE_CAR_MUTATION, { id, input }, token);
    return data.updateCar;
  }

  async deleteCar(id: string, token: string) {
    const data = await this.graphqlClient.mutateWithAuth(DELETE_CAR_MUTATION, { id }, token);
    return data.deleteCar;
  }
}
