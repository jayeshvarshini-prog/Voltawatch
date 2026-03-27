import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class BatchError {
  @Field(() => Int)
  index!: number;

  @Field()
  message!: string;
}

@ObjectType()
export class BatchResult {
  @Field(() => Int)
  accepted!: number;

  @Field(() => Int)
  rejected!: number;

  @Field(() => [BatchError])
  errors!: BatchError[];
}
