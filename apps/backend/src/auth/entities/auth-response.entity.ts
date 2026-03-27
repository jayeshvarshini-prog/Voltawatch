import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UserEntity {
  @Field()
  id!: string;

  @Field()
  email!: string;

  @Field()
  name!: string;
}

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken!: string;

  @Field()
  refreshToken!: string;

  @Field(() => UserEntity)
  user!: UserEntity;
}
