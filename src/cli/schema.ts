import {initOffsura} from "../index";
import {getSchema} from "../schema";
import {writeFileSync} from "fs";
import {printSchema} from "graphql";
import {getConnection} from "../db";

const configPath = process.argv[2];
async function schema() {
  await initOffsura(configPath);
  await getConnection().destroy();
  const schema = getSchema();
  writeFileSync('schema.graphql', printSchema(schema));
}
schema();
