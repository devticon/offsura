import { initConnection } from "./db";
import { graphql } from "graphql";
import { setGlobalConfig } from "./config";
import { OffsuraRuntimeConfig } from "./interfaces";
import { getSchema } from "./schema";
import { Connection } from "typeorm/browser";

let connection: Connection;
export async function initOffsura(config: OffsuraRuntimeConfig) {
  setGlobalConfig(config);
  connection = await initConnection(config.typeorm);
  getSchema(connection);

  return { connection };
}

export function offsura(source: string, variableValues = {}) {
  const schema = getSchema(connection);
  return graphql({ schema, source, variableValues });
}
