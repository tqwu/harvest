
import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql"
import type { NextApiRequest } from 'next'

import { WorkspaceCount, Workspace, WorkspaceCreate, WorkspaceDelete } from "./schema"
import { WorkspaceService } from "./service"

@Resolver()
export class WorkspaceResolver {

  // Retrieve total number of workspaces in db
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query(returns => WorkspaceCount)
  async countWorkspace(
  ): Promise<WorkspaceCount> {
    return await new WorkspaceService().count();
  }
  
  // List all workspaces corresponding to the logged in user
  @Authorized("member")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Query(returns => [Workspace])
  async workspace(
    @Ctx() request: NextApiRequest
  ): Promise<Workspace[]> {
    const owned = await new WorkspaceService().listOwned(request.user.id);
    const accessible = await new WorkspaceService().listAccessible(request.user.id);
    const workspaces = [...owned, ...accessible]
    return workspaces;
  }

  // Create a workspace
  @Authorized("member")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Mutation(returns => Workspace)
  async createWorkspace(
    @Arg("input") input: WorkspaceCreate,
    @Ctx() request: NextApiRequest
  ): Promise<Workspace> {
    return await new WorkspaceService().create(request.user.id, input);
  }

  // Delete a workspace
  @Authorized("member")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @Mutation(returns => Workspace)
  async deleteWorkspace(
    @Arg("input") input: WorkspaceDelete,
    @Ctx() request: NextApiRequest
  ): Promise<Workspace> {
    return await new WorkspaceService().delete(request.user.id, input);
  }

}
