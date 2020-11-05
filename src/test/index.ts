import {readFileSync} from "fs";
import {initOffsura, offsura} from "../index";

async function main() {
  await initOffsura("../offsura.js")
  const query = readFileSync('./test/product_connection.graphql').toString();
  console.time("result");
  const result = await offsura(query);
  console.log(JSON.stringify(result, null, 2));
  console.timeEnd("result");
}
main();
