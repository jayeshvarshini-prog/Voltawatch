import { Injectable } from '@nestjs/common';
import { GraphQLClientService } from '../graphql-client/graphql-client.service';
import { gql } from '@apollo/client/core';

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        name
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        name
      }
    }
  }
`;

const REFRESH_MUTATION = gql`
  mutation Refresh($token: String!) {
    refreshToken(token: $token) {
      accessToken
      refreshToken
      user {
        id
        email
        name
      }
    }
  }
`;

@Injectable()
export class AuthService {
  constructor(private readonly graphqlClient: GraphQLClientService) {}

  async login(email: string, password: string) {
    const data = await this.graphqlClient.mutate(LOGIN_MUTATION, {
      input: { email, password },
    });
    return data.login;
  }

  async register(email: string, password: string, name: string) {
    const data = await this.graphqlClient.mutate(REGISTER_MUTATION, {
      input: { email, password, name },
    });
    return data.register;
  }

  async refresh(token: string) {
    const data = await this.graphqlClient.mutate(REFRESH_MUTATION, { token });
    return data.refreshToken;
  }
}
