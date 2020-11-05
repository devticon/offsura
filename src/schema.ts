import {GraphQLSchema} from "graphql";
import {buildSchema} from "./graphql/buildSchema";
import {getConnection} from "./db";
import {getVersionMetadata} from "./version";

let schema: GraphQLSchema;

export function getSchema() {
  if (!schema) {
    const metadata = getVersionMetadata();
    schema = buildSchema(metadata, getConnection());
  }
  return schema;
}
