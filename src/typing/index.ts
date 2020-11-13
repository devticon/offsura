import { ColumnType } from "typeorm";

const psqlToSqliteMap: Map<string, string> = new Map<string, string>();
psqlToSqliteMap.set("timestamp with time zone", "datetime");
psqlToSqliteMap.set("character varying", "varying character");

const sqlToGqlMap: Map<string, string> = new Map<string, string>();
sqlToGqlMap.set("uuid", "uuid");
sqlToGqlMap.set("datetime", "String");
sqlToGqlMap.set("boolean", "Boolean");
sqlToGqlMap.set("varying character", "String");
sqlToGqlMap.set("text", "String");
sqlToGqlMap.set("integer", "Int");

export function psqlToSqlite(type: string) {
  return psqlToSqliteMap.get(type) || type;
}

function sqlToGql(type: string) {
  const mapped = sqlToGqlMap.get(type);
  if (!mapped) {
    console.log("missing gql map type", type);
    return type;
  }
  return mapped;
}
export function sqlToGraphql(column: ColumnType, nullable): string {
  return `${sqlToGql(column as string)}${nullable ? "" : "!"}`;
}
