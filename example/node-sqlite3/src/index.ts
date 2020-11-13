const moduleAlias = require("module-alias");
moduleAlias.addAlias("typeorm/browser", "typeorm");

import { graphqlHTTP } from "express-graphql";
import playground from "graphql-playground-middleware-express";
import {
  initOffsura,
  OffsuraConfig,
  startReplication,
  getOffsuraSchema,
} from "../../../dist";
import { entities } from "../entities";
import * as express from "express";

const app = express();

async function main() {
  const config: OffsuraConfig = require("../offsura.config");
  const { connection } = await initOffsura(config, {
    entities,
    webSocketImpl: require("ws"),
  });
  startReplication(config.replication, connection);

  app.get(
    "/",
    playground({
      endpoint: "/graphql",
    })
  );
  app.use(
    "/graphql",
    graphqlHTTP({
      schema: getOffsuraSchema(connection),
      graphiql: true,
    })
  );

  app.listen(4000);
}

main();
