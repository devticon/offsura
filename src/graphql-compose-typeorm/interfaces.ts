import { ObjectLiteral } from "typeorm";
import { QueryDeepPartialEntity } from "typeorm/browser/query-builder/QueryPartialEntity";
import { ObjectTypeComposerFieldConfigMapDefinition } from "graphql-compose/lib/ObjectTypeComposer";

export interface StringExp {
  _eq?: string;
  _like?: string;
  _ilike?: string;
  _qt?: string;
  _qte?: string;
  _lt?: string;
  _lte?: string;
  _in?: string[];
  _is_nul: boolean;
  _neq?: string;
  _nilike?: string;
  _nin?: string[];
}

export type WhereArg = Record<string, StringExp> & {
  _and?: WhereArg;
  _or: WhereArg;
};

export type OrderByArg = Record<string, "ASC" | "DESC">;

export interface ConnectionArgs {
  first?: number;
  last?: number;
  after?: string;
  before?: string;
  order_by?: OrderByArg;
  where?: WhereArg;
}

export interface ConnectionResult<T> {
  edges: {
    cursor: string;
    node: T;
  }[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
}

export interface InsertOnConflictArg {
  update_columns: string[];
  where?: WhereArg;
}

export interface InsertArgs<T = ObjectLiteral> {
  objects: QueryDeepPartialEntity<T>[];
  on_conflict?: InsertOnConflictArg;
}

export interface InsertOneArgs<T = ObjectLiteral> {
  object: QueryDeepPartialEntity<T>;
  on_conflict?: InsertOnConflictArg;
}

export interface UpdateOneArgs<T = ObjectLiteral> {
  _set: QueryDeepPartialEntity<T>;
  pk_columns?: Record<string, any>;
}

export interface UpdateArgs<T = ObjectLiteral> {
  where: WhereArg;
  _set: QueryDeepPartialEntity<T>;
}

export interface DeleteArgs<T = ObjectLiteral> {
  where: WhereArg;
}

export interface DeleteOneArgs<T = ObjectLiteral> {
  pk_columns: Record<string, any>;
}

export interface MutationResponse {
  affected_rows: number;
  returning: ObjectLiteral[];
}
