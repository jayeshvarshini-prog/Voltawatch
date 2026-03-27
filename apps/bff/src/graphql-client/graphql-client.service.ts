import { Injectable } from '@nestjs/common';
import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client/core';
import fetch from 'cross-fetch';

@Injectable()
export class GraphQLClientService {
  private client: ApolloClient<any>;
  private graphqlEndpoint: string;

  constructor() {
    this.graphqlEndpoint = process.env.GRAPHQL_ENDPOINT || 'http://localhost:5000/graphql';

    this.client = new ApolloClient({
      link: new HttpLink({
        uri: this.graphqlEndpoint,
        fetch,
      }),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: { fetchPolicy: 'no-cache' },
        mutate: { fetchPolicy: 'no-cache' },
      },
    });

    // Apollo Client targets this.graphqlEndpoint
  }

  getClient() {
    return this.client;
  }

  async query<T = any>(query: any, variables?: any): Promise<T> {
    const result = await this.client.query({
      query: typeof query === 'string' ? gql(query) : query,
      variables,
    });
    return result.data;
  }

  async mutate<T = any>(mutation: any, variables?: any): Promise<T> {
    const result = await this.client.mutate({
      mutation: typeof mutation === 'string' ? gql(mutation) : mutation,
      variables,
    });
    return result.data;
  }

  async mutateWithAuth<T = any>(mutation: any, variables: any, token: string): Promise<T> {
    const authClient = new ApolloClient({
      link: new HttpLink({
        uri: this.graphqlEndpoint,
        fetch,
        headers: { Authorization: `Bearer ${token}` },
      }),
      cache: new InMemoryCache(),
      defaultOptions: { mutate: { fetchPolicy: 'no-cache' } },
    });

    const result = await authClient.mutate({
      mutation: typeof mutation === 'string' ? gql(mutation) : mutation,
      variables,
    });
    return result.data;
  }
}
