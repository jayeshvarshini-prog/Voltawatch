import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class HealthStatus {
  @Field()
  status!: string;

  @Field()
  timestamp!: Date;

  @Field()
  uptime!: number;

  @Field()
  database!: string;
}
