const moduleAlias = require("module-alias");
moduleAlias.addAlias("typeorm/browser", "typeorm");

import { OffsuraRuntimeConfig } from "../../../dist/interfaces";
import { initOffsura } from "../../../dist";
import { startReplication } from "../../../dist/typeorm-hasura-replication";

async function main() {
  const config: OffsuraRuntimeConfig = {
    versionFilePath: ".offsura",
    replication: {
      hasura: {
        url: "https://hasura.test.novitus.devticon.com",
      },
      webSocketImpl: require("ws"),
      entitiesDir: "entities",
      tables: ["product_categories", "products", "products_product_categories"],
    },
    typeorm: {
      type: "sqlite",
      database: "sqlite",
      synchronize: true,
      entities: ["entities/**.entity{.ts,.js}"],
      logging: true,
    },
  };

  const { connection } = await initOffsura(config);
  startReplication(config.replication, connection);

  // const query = readFileSync(__dirname + "/get-product.graphql").toString();
  // console.time("result");
  // const result = await offsura(query);
  // console.log(JSON.stringify(result, null, 2));
  // console.timeEnd("result");
}
main();
