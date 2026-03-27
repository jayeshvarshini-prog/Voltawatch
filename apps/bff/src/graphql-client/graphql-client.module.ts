import { Module, Global } from '@nestjs/common';
import { GraphQLClientService } from './graphql-client.service';

@Global()
@Module({
  providers: [GraphQLClientService],
  exports: [GraphQLClientService],
})
export class GraphQLClientModule {}
