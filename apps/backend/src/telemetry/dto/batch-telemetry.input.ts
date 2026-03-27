import { InputType, Field } from '@nestjs/graphql';
import { ValidateNested, ArrayMaxSize, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTelemetryInput } from './create-telemetry.input';

@InputType()
export class BatchTelemetryInput {
  @Field(() => [CreateTelemetryInput])
  @ValidateNested({ each: true })
  @Type(() => CreateTelemetryInput)
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  readings!: CreateTelemetryInput[];
}
