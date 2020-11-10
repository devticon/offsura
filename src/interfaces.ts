import { HasuraConfig } from "./husura/interfaces";
import { ReplicationConfig } from "./replications/interfaces";
import { ConnectionOptions } from "typeorm/connection/ConnectionOptions";

export interface OffsuraConfig {
  hasura: HasuraConfig;
  replication: ReplicationConfig;
  typeorm: ConnectionOptions;
  versionFilePath?: string;
  versionTable?: string;
  cursorsTable?: string;
  waitForFirstReplication?: boolean;
}
