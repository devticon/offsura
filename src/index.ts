import {initConnection} from "./db";
import {graphql} from "graphql";
import {setGlobalConfig} from "./config";
import {OffsuraConfig} from "./interfaces";
import {getSchema} from "./schema";

export async function initOffsura(config: OffsuraConfig | string) {
  if (typeof config === 'string') {
    config = require(config) as OffsuraConfig
  }
  setGlobalConfig(config);
  console.time("db init");
  await initConnection();
  getSchema();
}

export function offsura(source: string) {
  const schema = getSchema();
  return graphql({ schema, source });
}
