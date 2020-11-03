import { replicate, ToApply } from "./replications/core/replicate";
import { init } from "./db";
import { hasuraClient } from "./hasuraClient";

async function main() {
  await init();
  // await replicate("product_category", "updatedAt");
  // await replicate("product", undefined, async docs => {
  //   const products: ToApply = { table: "product", data: [] };
  //   const productCategories: ToApply = {
  //     table: "product_product_category",
  //     data: []
  //   };
  //   for (const { categories, ...rest } of docs) {
  //     products.data.push(rest);
  //     for (const { categoryId } of categories) {
  //       productCategories.data.push({
  //         product_id: rest.id,
  //         category_id: categoryId
  //       });
  //     }
  //   }
  //
  //   return [products, productCategories];
  // });

  // const a = await knex("product").first();
}
main();
