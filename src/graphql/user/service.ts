
import { UserCount, PublicUser, UserCreate, UserDelete } from "./schema"
import { pool } from "../db";
import * as bcrypt from "bcrypt";

export class UserService {

  // Retrieve the number of total workspaces in the database
  public async count(): Promise<UserCount> {
    const select = `SELECT COUNT(*) FROM member;`;
    const query = {
      text: select,
      values: [],
    };
    const {rows} = await pool.query(query);
    return rows[0];
  }

  // Retrieve a user by email
  private async get(email: string): Promise<string|undefined> {
    const select = `SELECT member->>'email' as email FROM member WHERE member->>'email' = $1`;
    const query = {
      text: select,
      values: [email],
    };
    const {rows} = await pool.query(query);
    return rows.length == 1 ? rows[0].email : undefined;
  }

  // Retrieve all users
  public async list(): Promise<PublicUser[]> {
    const select = `SELECT (jsonb_build_object('id', id, 'name', member->>'name')) AS member FROM member`;
    const query = {
      text: select,
      values: [],
    };
    const {rows} = await pool.query(query);
    const members = [];
    for (const row of rows) {
      members.push(row.member);
    }
    return members;
  }

  // Create a user
  public async create(input: UserCreate): Promise<PublicUser> {
  
    // If email exists in db, throw error
    const existing = await this.get(input.email);
    if (existing) {
      throw new Error("User with this email already exists");
    }

    // Create a new user
    const insert = `INSERT INTO member(id, member) VALUES 
    (gen_random_uuid(), $1) RETURNING *`;
    const hashed: string = bcrypt.hashSync(input.password, 10);
    const data = {
      email: input.email,
      name: input.name,
      roles: ["member"],
      password: hashed
    };
    const query = {
      text: insert,
      values: [data],
    };
    const {rows} = await pool.query(query);
    const created = {
      id: rows[0].id,
      name: rows[0].member.name,
    }
    return created;
  }

  // Delete a user by id
  public async delete(input: UserDelete): Promise<PublicUser> {
    const deleteQuery = `DELETE FROM member WHERE id = $1 RETURNING *`;
    const query = {
      text: deleteQuery,
      values: [input.id],
    };
    const {rows} = await pool.query(query);
    const deleted = {
      id: rows[0].id,
      name: rows[0].member.name,
    }
    return deleted;
  }

}
