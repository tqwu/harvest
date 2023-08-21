import { Message, MessageCreate, MessageDelete, MessageEdit } from "./schema";
import { pool } from "../db";

export class MessageService {
  // Checking if the logged in user is the author of a message
  private async isAuthor(uid: string, mid: string): Promise<boolean> {
    const select = `SELECT data->>'sender' AS uid FROM message WHERE id = $1`;
    const query = {
      text: select,
      values: [mid],
    };
    const { rows } = await pool.query(query);
    const messageAuthor = rows[0].uid;
    return messageAuthor === uid;
  }

  // Checking if the logged in user is the owner of the workspace the message is in
  private async isWorkspaceOwner(uid: string, mid: string): Promise<boolean> {
    const select = `SELECT workspace.uid FROM workspace WHERE workspace.id = (
      SELECT channel.wid FROM channel WHERE channel.id = (
        SELECT message.cid FROM message WHERE message.id = $1
        )
    );`;
    const query = {
      text: select,
      values: [mid],
    };
    const { rows } = await pool.query(query);
    const workspaceOwnerId = rows[0].uid;
    return workspaceOwnerId === uid;
  }

  // Retreive all messages in a channel using channel id
  public async list(cid: string): Promise<Message[]> {
    const select = `SELECT jsonb_build_object('id', id, 'cid', cid, 'sender', data->>'sender', 'message', data->>'message')
    AS message FROM message WHERE cid = $1`;
    const query = {
      text: select,
      values: [cid],
    };
    const { rows } = await pool.query(query);
    const messages = [];
    for (const row of rows) {
      messages.push(row.message);
    }
    return messages;
  }

  // Create a new message in a channel using channel id
  public async create(uid: string, input: MessageCreate): Promise<Message> {
    const insert = `INSERT INTO message(id, cid, data) VALUES (gen_random_uuid(), $1, $2) RETURNING *`;
    const query = {
      text: insert,
      values: [input.cid, { sender: uid, message: input.message }],
    };
    const { rows } = await pool.query(query);
    const created = {
      id: rows[0].id,
      cid: rows[0].cid,
      sender: rows[0].data.sender,
      message: rows[0].data.message,
    };
    return created;
  }

  // Delete a message using message id
  public async delete(uid: string, input: MessageDelete): Promise<Message> {
    const isMessageAuthor = await this.isAuthor(uid, input.id);
    const isWorkspaceOwner = await this.isWorkspaceOwner(uid, input.id);
    if (!isMessageAuthor && !isWorkspaceOwner) {
      throw new Error(
        "Access denied! You don't have permission for this action!",
      );
    }
    const deleteQuery = `DELETE FROM message WHERE id = $1 RETURNING *`;
    const query = {
      text: deleteQuery,
      values: [input.id],
    };
    const { rows } = await pool.query(query);
    const deleted = {
      id: rows[0].id,
      cid: rows[0].cid,
      sender: rows[0].data.sender,
      message: rows[0].data.message,
    };
    return deleted;
  }

  // Edit a message using message id
  public async edit(uid: string, input: MessageEdit): Promise<Message> {
    const isMessageAuthor = await this.isAuthor(uid, input.id);
    if (!isMessageAuthor) {
      throw new Error(
        "Access denied! You don't have permission for this action!",
      );
    }
    const updatedData = {
      sender: uid,
      message: input.message,
    };
    const edit = `UPDATE message SET data = $1 WHERE id = $2 RETURNING *`;
    const query = {
      text: edit,
      values: [updatedData, input.id],
    };
    const { rows } = await pool.query(query);
    const deleted = {
      id: rows[0].id,
      cid: rows[0].cid,
      sender: rows[0].data.sender,
      message: rows[0].data.message,
    };
    return deleted;
  }
}
