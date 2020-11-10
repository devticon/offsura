import { HasuraConfig } from "./husura/interfaces";

export interface ReplicationTableConfig {
  table: string;
  columns: string[];
  sortColumn: string;
}
export interface ReplicationConfig {
  hasura: HasuraConfig;
  tables: (string | ReplicationTableConfig)[];
  entitiesDir: string;
}
