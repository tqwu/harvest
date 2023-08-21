import { Query, Resolver, Mutation, Arg, Authorized, Ctx } from "type-graphql";
import type { NextApiRequest } from "next";

import { Message, MessageCreate, MessageDelete, MessageEdit } from "./schema";
import { MessageService } from "./service";

@Resolver()
export class MessageResolver {
  // List all messages in a channel
  @Authorized("member")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query((returns) => [Message])
  async message(@Arg("cid") cid: string): Promise<Message[]> {
    return new MessageService().list(cid);
  }

  //  Create a new message
  @Authorized("member")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Mutation((returns) => Message)
  async createMessage(
    @Arg("input") input: MessageCreate,
    @Ctx() request: NextApiRequest,
  ): Promise<Message> {
    return await new MessageService().create(request.user.id, input);
  }

  // Delete a message
  @Authorized("member")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Mutation((returns) => Message)
  async deleteMessage(
    @Arg("input") input: MessageDelete,
    @Ctx() request: NextApiRequest,
  ): Promise<Message> {
    return await new MessageService().delete(request.user.id, input);
  }

  // Edit a message
  @Authorized("member")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Mutation((returns) => Message)
  async editMessage(
    @Arg("input") input: MessageEdit,
    @Ctx() request: NextApiRequest,
  ): Promise<Message> {
    return await new MessageService().edit(request.user.id, input);
  }
}
