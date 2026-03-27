import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CreateCarInput } from './create-car.input';

@InputType()
export class UpdateCarInput extends PartialType(CreateCarInput) {
  @Field({ nullable: true })
  @IsOptional()
  lastServiceDate?: Date;
}
