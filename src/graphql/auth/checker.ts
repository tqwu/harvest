import { AuthChecker } from "type-graphql";
import type { NextApiRequest } from "next";

import { AuthService } from "./service";

interface CustomNextApiRequest extends NextApiRequest {
  req: {
    headers: {
      authorization: string;
    };
  };
}

async function authChecker(
  context: NextApiRequest,
  authHeader: string,
  roles: string[],
): Promise<boolean> {
  try {
    context.user = await new AuthService().check(authHeader, roles);
  } catch (err) {
    return false;
  }
  return true;
}

export const nextAuthChecker: AuthChecker<CustomNextApiRequest> = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { root, args, context, info },
  roles,
) => {
  return await authChecker(context, context.req.headers.authorization, roles);
};
