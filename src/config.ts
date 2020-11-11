import { OffsuraConfig } from "./interfaces";

const defaults: Partial<OffsuraConfig> = {
  waitForFirstReplication: true,
  versionFilePath: "../var/version",
  versionTable: "offsura_version",
  cursorsTable: "offsura_cursors",
};
export let offsuraConfig: OffsuraConfig;

export function setGlobalConfig(config: OffsuraConfig) {
  offsuraConfig = {
    ...defaults,
    ...config,
  };
}
