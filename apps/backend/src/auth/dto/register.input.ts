import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MinLength, IsString } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @MinLength(8)
  password!: string;

  @Field()
  @IsString()
  name!: string;
}
