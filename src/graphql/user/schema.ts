import { Field, ObjectType, InputType } from "type-graphql";
import { Matches, Length } from "class-validator";

@ObjectType("UserCount")
export class UserCount {
  @Field()
  count!: number;
}

@ObjectType()
export class PublicUser {
  @Field()
  @Matches(
    /[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}/,
  )
  id!: string;
  @Field()
  @Length(1, 32)
  name!: string;
}

@InputType("UserCreate")
export class UserCreate {
  @Field()
  @Length(1, 32)
  email!: string;
  @Field()
  @Length(1, 32)
  name!: string;
  @Field()
  @Length(1, 32)
  password!: string;
}

@InputType("UserDelete")
export class UserDelete {
  @Field()
  @Matches(
    /[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}/,
  )
  id!: string;
}
