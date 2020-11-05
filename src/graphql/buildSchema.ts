import { TableMetadata } from "../version/interfaces";
import { buildType } from "./buildType";
import { buildCrud } from "./buildCrud";
import { buildRelations } from "./buildRelations";
import { schemaComposer } from "graphql-compose";
import Knex = require("knex");

export function buildSchema(
  metadata: Record<string, TableMetadata>,
  connection: Knex
) {
  const tablesMetadata = Object.values(metadata);
  for (const tableMetadata of tablesMetadata) {
    buildType(tableMetadata);
  }
  for (const tableMetadata of tablesMetadata) {
    buildRelations(tableMetadata, connection);
  }
  for (const tableMetadata of tablesMetadata) {
    buildCrud(tableMetadata, connection);
  }
  return schemaComposer.buildSchema();
}
