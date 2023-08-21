import { Field, InputType, ObjectType } from "type-graphql";
import { Matches, Length } from "class-validator";

@ObjectType("WorkspaceCount")
export class WorkspaceCount {
  @Field()
  count!: number;
}

@ObjectType()
export class Workspace {
  @Field()
  @Matches(
    /[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}/,
  )
  id!: string;
  @Field()
  @Matches(
    /[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}/,
  )
  uid!: string;
  @Field()
  @Length(1, 32)
  name!: string;
}

@InputType("WorkspaceCreate")
export class WorkspaceCreate {
  @Field()
  @Length(1, 32)
  name!: string;
}

@InputType("WorkspaceDelete")
export class WorkspaceDelete {
  @Field()
  @Matches(
    /[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}/,
  )
  id!: string;
}
