
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";

import { Credentials, User } from './schema';

import secrets from '../../../data/secrets.json';
import { pool } from '../db';

import { SessionUser } from "../../types/custom";
import { VerifyCallback } from "jsonwebtoken";

export class AuthService {

  public async login(credentials: Credentials): Promise<User>  {

    // Retrieving user from database
    const select = `SELECT member || jsonb_build_object('id', id) AS member
    FROM member WHERE member->>'email' = $1`;
    const query = {
      text: select,
      values: [credentials.email],
    };
    const {rows} = await pool.query(query);
    const user = rows.length == 1 ? rows[0].member : undefined;

    return new Promise((resolve, reject) => {
      if (user && bcrypt.compareSync(credentials.password, user.password)) {
        const accessToken = jwt.sign(
          {email: user.email, name: user.name, id: user.id, roles: user.roles}, 
          secrets.accessToken, {
            expiresIn: '30m',
            algorithm: 'HS256'
          });
        resolve({name: user.name, id: user.id, accessToken: accessToken});
      } else {
        reject(new Error("Unauthorised"));
      }
    })
  }

  public async check(authHeader?: string, roles?: string[]): Promise<SessionUser>  {
    return new Promise((resolve, reject) => {
      if (!authHeader) {
        reject(new Error("Unauthorised"));
      }
      else {
        const token = authHeader.split(' ')[1];
        const verifyCallback: VerifyCallback = (err, rawUser) => {
          const user = rawUser as SessionUser;
          if (err) {
            reject(err);
          } else if (roles){
            for (const role of roles) {
              if (!user.roles || !user.roles.includes(role)) {
                reject(new Error("Unauthorised"));
              }
            }
          }
          resolve(user);
        }
        jwt.verify(token, secrets.accessToken, verifyCallback);
      }
    });
  }
}
