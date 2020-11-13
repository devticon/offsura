import { ReplicationConfig } from "./typeorm-hasura-replication/interfaces";
import { ConnectionOptions, ObjectType } from "typeorm/browser";

type Writeable<T> = { -readonly [P in keyof T]: T[P] };
export type TypeormConfig = Writeable<ConnectionOptions>;

export interface OffsuraConfig {
  replication: ReplicationConfig;
  typeorm: TypeormConfig;
  versionFilePath?: string;
  versionTable?: string;
  cursorsTable?: string;
  waitForFirstReplication?: boolean;
  usePlainRelayId?: boolean;
}

export interface OffsuraRuntimeConfig {
  webSocketImpl?: any;
  entities: ObjectType<any>[];
}
