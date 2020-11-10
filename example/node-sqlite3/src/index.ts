import { readFileSync } from "fs";
import { initOffsura, offsura } from "../../../dist";
import { replicate } from "../../../src/replications/replicate";
import { Product } from "../entities/Product.entity";
import { ProductCategory } from "../entities/ProductCategory.entity";
import { ProductsProductCategory } from "../entities/ProductsProductCategory.entity";

async function main() {
  const { connection } = await initOffsura();
  for (const entityType of [
    Product,
    ProductCategory,
    ProductsProductCategory,
  ]) {
    await replicate(connection.getMetadata(entityType));
  }

  const query = readFileSync(__dirname + "/get-product.graphql").toString();
  console.time("result");
  const result = await offsura(query);
  console.log(JSON.stringify(result, null, 2));
  console.timeEnd("result");
}
main();
