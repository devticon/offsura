import { HasuraConfig } from "./husura/interfaces";
import { ReplicationConfig } from "./replications/interfaces";
import { ConnectionOptions } from "typeorm/browser";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };
export type TypeormConfig = Writeable<ConnectionOptions>;

export interface OffsuraRuntimeConfig {
  hasura: HasuraConfig;
  replication: ReplicationConfig;
  typeorm: TypeormConfig;
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
