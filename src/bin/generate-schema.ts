import { initOffsura } from "../index";
import { getSchema } from "../schema";
import { writeFileSync } from "fs";
import { printSchema } from "graphql";
import { getConnection } from "../db";

export async function generateSchema() {
  await initOffsura();
  await getConnection().destroy();
  const schema = getSchema();
  writeFileSync("schema.graphql", printSchema(schema));
}
