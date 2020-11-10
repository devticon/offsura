import { HasuraConfig } from "./husura/interfaces";
import { ReplicationConfig } from "./replications/interfaces";
import { ConnectionOptions } from "typeorm/browser";

export interface OffsuraRuntimeConfig {
  hasura: HasuraConfig;
  replication: ReplicationConfig;
  typeorm: ConnectionOptions;
  versionFilePath?: string;
  versionTable?: string;
  cursorsTable?: string;
  waitForFirstReplication?: boolean;
}
export interface OffsuraCliConfig {
  hasura: HasuraConfig;
  replication: ReplicationConfig;
  typeorm: ConnectionOptions;
  versionFilePath?: string;
  versionTable?: string;
  cursorsTable?: string;
  waitForFirstReplication?: boolean;
}
