
import { Channel, ChannelCreate, ChannelDelete } from "./schema"
import { WorkspaceService } from "../workspace/service";
import { pool } from "../db";

export class ChannelService {

  // Retrieve all channels in a workspace using workspace id
  public async list(wid: string): Promise<Channel[]> {
    const select = `SELECT data || jsonb_build_object('id', id, 'wid', wid) AS channel
    FROM channel WHERE wid = $1`;
    const query = {
      text: select,
      values: [wid],
    };
    const {rows} = await pool.query(query);
    const channels = [];
    for (const row of rows) {
      channels.push(row.channel);
    }
    return channels;
  }

  // Create a new channel in a workspace using workspace id if workspace belongs to current user
  public async create(uid: string, input: ChannelCreate): Promise<Channel> {

    console.log('running?');

    // Checking whether the workspace the channel will be created in,
    // belongs to the current user using the workspace id
    const isWorkspaceOwner = await new WorkspaceService().isOwner(uid, input.wid, false);
    if (!isWorkspaceOwner) {
      throw new Error("Access denied! You don't have permission for this action!");
    }
    
    const insert = `INSERT INTO channel(id, wid, data) VALUES (gen_random_uuid(), $1, $2) RETURNING *`;
    const query = {
      text: insert,
      values: [input.wid, {name: input.name}],
    };
    const {rows} = await pool.query(query);
    const created = {
      id: rows[0].id,
      wid: rows[0].wid,
      name: rows[0].data.name,
    }
    return created;
  }

  // Delete a new channel in a workspace using channel id if workspace belongs to current user
  public async delete(uid: string, input: ChannelDelete): Promise<Channel> {

    // Checking whether the workspace the channel is in belongs to the current user using the channel id
    const isWorkspaceOwner = await new WorkspaceService().isOwner(uid, input.id, true);
    if (!isWorkspaceOwner) {
      throw new Error("Access denied! You don't have permission for this action!");
    }

    const deleteQuery = `DELETE FROM channel WHERE id = $1 RETURNING *`;
    const query = {
      text: deleteQuery,
      values: [input.id],
    };
    const {rows} = await pool.query(query);
    const deleted = {
      id: rows[0].id,
      wid: rows[0].wid,
      name: rows[0].data.name,
    }
    return deleted;
  }

}
