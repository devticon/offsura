import { ColumnType } from "typeorm";

const psqlToSqliteMap: Map<string, string> = new Map<string, string>();
psqlToSqliteMap.set("timestamp with time zone", "datetime");
psqlToSqliteMap.set("character varying", "varying character");

const sqlToGql: Map<string, string> = new Map<string, string>();

export function psqlToSqlite(type: string) {
  return psqlToSqliteMap.get(type) || type;
}

export function sqlToGraphql(column: ColumnType, nullable): string {
  return `String${nullable ? "" : "!"}`;
}
