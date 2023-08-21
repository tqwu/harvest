
import { Query, Resolver, Mutation, Arg, Authorized } from "type-graphql"

import { UserCount, PublicUser, UserCreate, UserDelete } from "./schema"
import { UserService } from "./service"

@Resolver()
export class UserResolver {

  // Retrieve total number of workspaces in db
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query(returns => UserCount)
  async countUser(
  ): Promise<UserCount> {
    return await new UserService().count();
  }

  // List all users
  @Authorized("member")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query(returns => [PublicUser])
  async user(
  ): Promise<PublicUser[]> {
    return await new UserService().list();
  }

  // Create a User
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Mutation(returns => PublicUser)
  async createUser(
    @Arg("input") input: UserCreate,
  ): Promise<PublicUser> {
    return await new UserService().create(input);
  }

  // Delete a User
  @Authorized("admin")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Mutation(returns => PublicUser)
  async deleteUser(
    @Arg("input") input: UserDelete,
  ): Promise<PublicUser> {
    return await new UserService().delete(input);
  }
  
}
