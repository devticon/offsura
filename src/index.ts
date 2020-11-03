import { replicate } from "./replications/core/replicate";
import { initConnection } from "./db";
import {getSchema} from "./schema/getSchema";

async function main() {
  await initConnection();
  const schema = await getSchema('products');
  await replicate(schema);
}
main();
