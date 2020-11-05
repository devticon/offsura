import {HasuraConfig} from "./husura/interfaces";
import Knex = require("knex");
import {ReplicationConfig} from "./replications/interfaces";

export interface OffsuraConfig {
  hasura: HasuraConfig,
  replication: ReplicationConfig,
  knexConfig: Knex.Config
  versionFilePath?: string;
  versionTable?: string;
  cursorsTable?: string;
  waitForFirstReplication?: boolean;
}
