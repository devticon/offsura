import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLString } from "graphql";

const typesMap = new Map();
typesMap.set("uuid", "ID");
typesMap.set("character varying", "String");
typesMap.set("integer", "Int");
typesMap.set("timestamp with time zone", "String");
typesMap.set("timestamp", "String");
typesMap.set("text", "String");
typesMap.set("boolean", "Boolean");

export function mapType(type: string) {
  const mapped = typesMap.get(type);
  if (!mapped) {
    throw new Error(`Type ${type} is not found`);
  }
  return mapped;
}
