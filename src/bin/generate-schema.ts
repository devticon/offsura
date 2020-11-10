import { initOffsura } from "../index";
import { getConnection } from "typeorm/browser";
import { getSchema } from "../schema";
import { writeFileSync } from "fs";
import { printSchema } from "graphql";
import { loadOffsuraConfig } from "./load-config";

export async function generateSchema() {
  await initOffsura(loadOffsuraConfig());
  const connection = getConnection();
  const schema = getSchema(connection);
  await connection.close();
  writeFileSync("schema.graphql", printSchema(schema));
}
