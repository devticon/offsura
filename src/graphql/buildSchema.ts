import { TableMetadata } from "../version/interfaces";
import { buildType } from "./buildType";
import { buildConnectionResolver } from "./buildConnectionResolver";
import { buildRelations } from "./buildRelations";
import { schemaComposer } from "graphql-compose";
import Knex = require("knex");

export function buildSchema(
  metadata: Record<string, TableMetadata>,
  connection: Knex
) {
  const tablesMetadata = Object.values(metadata);
  for (const tableMetadata of tablesMetadata) {
    buildType(tableMetadata, connection);
  }
  for (const tableMetadata of tablesMetadata) {
    const resolver = buildConnectionResolver(tableMetadata);
    schemaComposer.Query.addFields({
      [`${tableMetadata.table}_connection`]: resolver
    });
  }
  for (const tableMetadata of tablesMetadata) {
    buildRelations(tableMetadata, connection);
  }
  return schemaComposer.buildSchema();
}
