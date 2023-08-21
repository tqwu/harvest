
import { WorkspaceCount, Workspace, WorkspaceCreate, WorkspaceDelete } from "./schema"
import { UUID } from "../../types/custom";
import { pool } from "../db";

export class WorkspaceService {
    
  // Retrieve the number of total workspaces in the database
  public async count(): Promise<WorkspaceCount> {
    const select = `SELECT COUNT(*) FROM workspace;`;
    const query = {
      text: select,
      values: [],
    };
    const {rows} = await pool.query(query);
    return rows[0];
  }

  /* 
  * isOwner checks if workspace belongs to logged in user
  * @param uid - user id
  * @param id - workspace or channel id
  * @param channelId - Whether the id is a channel id
  * @returns whether the workspace belongs to the user
  */
  public async isOwner(uid: UUID, id: UUID, channelId: boolean): Promise<boolean> {
    let select = '';
    let values: UUID[];
    if (channelId) {
      select = `SELECT uid FROM workspace AS uid WHERE id = (SELECT wid FROM channel WHERE id = $1)`;
      values = [id];
    } else {
      select = `SELECT uid FROM workspace AS uid WHERE id = $1`;
      values = [id];
    }
    const query = {
      text: select,
      values,
    };
    const {rows} = await pool.query(query);
    const workspaceOwnerId = rows[0].uid;
    return workspaceOwnerId === uid;
  }
  
  // Retrieve all owned workspaces for logged in user
  public async listOwned(id: UUID): Promise<Workspace[]> {
    const select = `SELECT data || jsonb_build_object('id', id, 'uid', uid)
    AS workspace FROM workspace WHERE uid = $1`;
    const query = {
      text: select,
      values: [id],
    };
    const {rows} = await pool.query(query);
    const workspaces = [];
    for (const row of rows) {
      workspaces.push(row.workspace);
    }
    return workspaces;
  }

  // Retrieve all accessible workspaces for logged in user
  public async listAccessible(id: UUID): Promise<Workspace[]> {
    const select = `SELECT data || jsonb_build_object('id', id, 'uid', uid)
    AS workspace FROM workspace WHERE id IN (SELECT wid FROM workspaceUser WHERE uid = $1)`;
    const query = {
      text: select,
      values: [id],
    };
    const {rows} = await pool.query(query);
    const workspaces = [];
    for (const row of rows) {
      workspaces.push(row.workspace);
    }
    return workspaces;
  }

  // Create a workspace
  public async create(id: UUID, input: WorkspaceCreate): Promise<Workspace> {
    const insert = `INSERT INTO workspace(id, uid, data) VALUES 
    (gen_random_uuid(), $1, $2) RETURNING *`;
    const query = {
      text: insert,
      values: [id, {name: input.name}],
    };
    const {rows} = await pool.query(query);
    const created = {
      id: rows[0].id,
      uid: rows[0].uid,
      name: rows[0].data.name,
    }
    return created;
  }

  // Delete a workspace if workspace belongs to current user
  public async delete(uid: UUID, input: WorkspaceDelete): Promise<Workspace> {
    const isOwner = await this.isOwner(uid, input.id, false);
    if (!isOwner) {
      throw new Error("Access denied! You don't have permission for this action!");
    }
    const deleteQuery = `DELETE FROM workspace WHERE id = $1 RETURNING *`;
    const query = {
      text: deleteQuery,
      values: [input.id],
    };
    const {rows} = await pool.query(query);
    const deleted = {
      id: rows[0].id,
      uid: rows[0].uid,
      name: rows[0].data.name,
    }
    return deleted;
  }

}
