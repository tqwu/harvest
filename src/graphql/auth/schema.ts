
import { Field, ObjectType, ArgsType } from "type-graphql"
import { Length, Matches } from "class-validator";

@ArgsType()
export class Credentials {
  @Field()
  @Matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
    email!: string
  @Field()
  @Length(8, 16)
    password!: string
}

@ObjectType()
export class User {
  @Field()
  @Length(1, 32)
    name!: string
  @Field()
  @Matches(/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}/)
    id!: string
  @Field()
    accessToken!: string
}
