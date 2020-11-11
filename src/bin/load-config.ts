import { OffsuraConfig } from "../interfaces";

export function loadOffsuraConfig(): OffsuraConfig {
  console.log("loading offsura config (cosmiconfig)");
  const result: {
    config: OffsuraConfig;
  } = require("cosmiconfig").cosmiconfigSync("offsura").search();
  if (!result) {
    throw new Error(`Offsura config not found`);
  }
  result.config.replication.webSocketImpl = require("ws");
  return result.config;
}
