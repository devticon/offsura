import { initConnection } from "./db";
import { graphql } from "graphql";
import { setGlobalConfig } from "./config";
import { OffsuraConfig } from "./interfaces";
import { getSchema } from "./schema";
import { cosmiconfigSync } from "cosmiconfig";

export function getOffsuraConfig(): OffsuraConfig {
  const result = cosmiconfigSync("offsura").search();
  if (!result) {
    throw new Error(`Offsura config not found`);
  }
  console.log(result);
  return result.config;
}
export async function initOffsura() {
  const config = getOffsuraConfig();
  setGlobalConfig(config);
  console.time("db init");
  await initConnection();
  getSchema();
}

export function offsura(source: string) {
  const schema = getSchema();
  return graphql({ schema, source });
}
