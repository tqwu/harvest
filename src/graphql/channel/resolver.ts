
import { Query, Resolver, Arg, Authorized, Mutation, Ctx } from "type-graphql"
import type { NextApiRequest } from 'next'

import { Channel, ChannelCreate, ChannelDelete } from "./schema"
import { ChannelService } from "./service"

@Resolver()
export class ChannelResolver {

  // List all channels in a workspace
  @Authorized("member")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query(returns => [Channel])
  async channel(
    @Arg("wid") wid: string,
  ): Promise<Channel[]> {
    return new ChannelService().list(wid);
  }

  // Create a channel
  @Authorized("member")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Mutation(returns => Channel)
  async createChannel(
    @Arg("input") input: ChannelCreate,
    @Ctx() request: NextApiRequest
  ): Promise<Channel> {
    console.log('user id resolver: ', request.user.id);
    return await new ChannelService().create(request.user.id, input);
  }

  // Delete a channel
  @Authorized("member")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Mutation(returns => Channel)
  async deleteChannel(
    @Arg("input") input: ChannelDelete,
    @Ctx() request: NextApiRequest
  ): Promise<Channel> {
    return await new ChannelService().delete(request.user.id, input);
  }
    
}
