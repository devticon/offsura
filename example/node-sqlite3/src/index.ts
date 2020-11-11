const moduleAlias = require("module-alias");
moduleAlias.addAlias("typeorm/browser", "typeorm");

import { entities } from "../entities";

import { OffsuraConfig } from "../../../dist/interfaces";
import { initOffsura } from "../../../dist";
import { startReplication } from "../../../dist/typeorm-hasura-replication";

async function main() {
  const config: OffsuraConfig = require("../offsura.config");
  const { connection } = await initOffsura(config, {
    entities,
    webSocketImpl: require("ws"),
  });
  startReplication(config.replication, connection);

  // const query = readFileSync(__dirname + "/get-product.graphql").toString();
  // console.time("result");
  // const result = await offsura(query);
  // console.log(JSON.stringify(result, null, 2));
  // console.timeEnd("result");
}
main();
