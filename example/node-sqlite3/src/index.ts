import {readFileSync} from "fs";
import {initOffsura, offsura} from "../../../dist";
const config = require('../offsura.js');

async function main() {
  await initOffsura(config);
  const query = readFileSync(__dirname + '/query.graphql').toString();
  console.time("result");
  const result = await offsura(query);
  console.log(JSON.stringify(result, null, 2));
  console.timeEnd("result");
}
main();
