import { SessionUser } from "../custom";

declare module "next" {
  export interface NextApiRequest {
    user: SessionUser;
  }
}

export {};
