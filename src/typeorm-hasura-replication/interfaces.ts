import { EntityMetadata } from "typeorm/browser";
import { BehaviorSubject, Observable } from "rxjs";

export interface ReplicationTableConfig {
  table: string;
  columns: string[];
  sortColumn: string;
}
export interface ReplicationConfig {
  hasura: HasuraConfig;
  webSocketImpl?: any;
  tables: (string | ReplicationTableConfig)[];
  entitiesDir: string;
}

export interface HasuraConfig {
  url: string;
}

export interface SubscribeResult<T = any> {
  nodes: T[];
  endCursor: string;
  hasNextPage: boolean;
  meta: EntityMetadata;
}

export type SubscribeRecord = {
  subject$: BehaviorSubject<string>;
  $: Observable<any>;
};

export type SubscribeRecords = Record<string, SubscribeRecord>;
