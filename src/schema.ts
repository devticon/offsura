import { GraphQLSchema } from "graphql";
import { buildSchema } from "./graphql-compose-typeorm";
import { Connection } from "typeorm/browser";

let schema: GraphQLSchema;

export function getSchema(connection: Connection) {
  if (!schema) {
    schema = buildSchema(connection);
  }
  return schema;
}
