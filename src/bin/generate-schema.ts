import { initOffsura } from "../index";
import { getConnection } from "typeorm";
import { getSchema } from "../schema";
import { writeFileSync } from "fs";
import { printSchema } from "graphql";

export async function generateSchema() {
  await initOffsura();
  const connection = getConnection();
  const schema = getSchema(connection);
  await connection.close();
  writeFileSync("schema.graphql", printSchema(schema));
}
