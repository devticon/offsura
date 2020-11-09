import { initConnection } from "./db";
import { graphql } from "graphql";
import { setGlobalConfig } from "./config";
import { OffsuraConfig } from "./interfaces";
import { getSchema } from "./schema";
import { cosmiconfigSync } from "cosmiconfig";
import { getConnection } from "typeorm";

export function getOffsuraConfig(): OffsuraConfig {
  const result = cosmiconfigSync("offsura").search();
  if (!result) {
    throw new Error(`Offsura config not found`);
  }
  return result.config;
}
export async function initOffsura() {
  const config = getOffsuraConfig();
  setGlobalConfig(config);
  const connection = await initConnection(config.typeorm);
  getSchema(connection);

  return { connection };
}

export function offsura(source: string) {
  const schema = getSchema(getConnection());
  return graphql({ schema, source });
}
