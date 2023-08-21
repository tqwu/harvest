import { createYoga } from "graphql-yoga";
import "reflect-metadata"; // must come before buildSchema
import { buildSchemaSync } from "type-graphql";

import { AuthResolver } from "../../graphql/auth/resolver";
import { UserResolver } from "../../graphql/user/resolver";
import { WorkspaceResolver } from "../../graphql/workspace/resolver";
import { ChannelResolver } from "../../graphql/channel/resolver";
import { MessageResolver } from "../../graphql/message/resolver";
import { nextAuthChecker } from "../../graphql/auth/checker";

const schema = buildSchemaSync({
  resolvers: [
    AuthResolver,
    UserResolver,
    WorkspaceResolver,
    ChannelResolver,
    MessageResolver,
  ],
  validate: true,
  authChecker: nextAuthChecker,
});

export default createYoga({
  schema,
  // Needed to be defined explicitly because our endpoint lives at a different path other than `/graphql`
  graphqlEndpoint: "/api/graphql",
});
