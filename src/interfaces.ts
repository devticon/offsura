import { HasuraConfig } from "./typeorm-hasura-replication/husura/interfaces";
import { ReplicationConfig } from "./typeorm-hasura-replication/interfaces";
import { ConnectionOptions } from "typeorm/browser";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };
export type TypeormConfig = Writeable<ConnectionOptions>;

export interface OffsuraRuntimeConfig {
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
