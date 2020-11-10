const moduleAlias = require("module-alias");
moduleAlias.addAlias("typeorm/browser", "typeorm");

import { readFileSync } from "fs";
import { initOffsura, offsura } from "../../../dist";
import { Product } from "../entities/Product.entity";
import { ProductCategory } from "../entities/ProductCategory.entity";
import { ProductsProductCategory } from "../entities/ProductsProductCategory.entity";
import { startReplication } from "../../../dist/replications";
import { OffsuraRuntimeConfig } from "../../../dist/interfaces";

async function main() {
  const config: OffsuraRuntimeConfig = {
    versionFilePath: ".offsura",
    replication: {
      hasura: {
        url: "https://hasura.test.novitus.devticon.com",
      },
      entitiesDir: "entities",
      tables: ["product_categories", "products", "products_product_categories"],
    },
    typeorm: {
      type: "sqlite",
      database: "sqlite",
      synchronize: true,
      entities: ["entities/**.entity{.ts,.js}"],
      logging: false,
    },
  };

  const { connection } = await initOffsura(config);
  startReplication(config.replication, connection);

  const query = readFileSync(__dirname + "/get-product.graphql").toString();
  console.time("result");
  const result = await offsura(query);
  console.log(JSON.stringify(result, null, 2));
  console.timeEnd("result");
}
main();
