import { OffsuraRuntimeConfig } from "../interfaces";

export function loadOffsuraConfig(): OffsuraRuntimeConfig {
  console.log("loading offsura config (cosmiconfig)");
  const result = require("cosmiconfig").cosmiconfigSync("offsura").search();
  if (!result) {
    throw new Error(`Offsura config not found`);
  }
  return result.config;
}
