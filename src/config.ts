import { OffsuraRuntimeConfig } from "./interfaces";

const defaults: Partial<OffsuraRuntimeConfig> = {
  waitForFirstReplication: true,
  versionFilePath: "../var/version",
  versionTable: "offsura_version",
  cursorsTable: "offsura_cursors",
};
export let offsuraConfig: OffsuraRuntimeConfig;

export function setGlobalConfig(config: OffsuraRuntimeConfig) {
  offsuraConfig = {
    ...defaults,
    ...config,
  };
}
