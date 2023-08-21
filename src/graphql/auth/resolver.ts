
import { Query, Resolver, Args } from "type-graphql"

import { Credentials, User } from "./schema"
import { AuthService } from "./service"

@Resolver()
export class AuthResolver {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query(returns => User)
  async login(
    @Args() credentials: Credentials,
  ): Promise<User> {
    return new AuthService().login(credentials);
  }
}
5