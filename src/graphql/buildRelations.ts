import { TableMetadata } from "../version/interfaces";
import { schemaComposer } from "graphql-compose";
import { getTableMetadata } from "../version";
import { oneToManyResolver } from "./oneToManyResolver";
import Knex = require("knex");
import { oneToOneResolver } from "./oneToOneResolver";
import { convertToColumnName, convertToGqlName } from "../husura/hasuraNames";

export function buildRelations(tableMetadata: TableMetadata, connection: Knex) {
  const {
    array_relationships,
    object_relationships
  } = tableMetadata.hasuraMetadata;

  if (object_relationships) {
    for (const relationMeta of object_relationships) {
      const relationColumn = relationMeta.using.foreign_key_constraint_on;
      const foreignMeta = tableMetadata.foreignKeys.find(
        f => f.column === relationColumn
      );
      if (schemaComposer.has(foreignMeta.referenceTable)) {
        const objectTypeComposer = schemaComposer.getOTC(tableMetadata.table);
        objectTypeComposer.setField(relationMeta.name, {
          type: foreignMeta.referenceTable,
          resolve: parent => {
            const resolverName = `${tableMetadata.table}_${foreignMeta.name}`;
            const childTableMetadata = getTableMetadata(
              foreignMeta.referenceTable
            );
            const parentKey =
              parent[convertToGqlName(tableMetadata, foreignMeta.column)];
            return oneToOneResolver({
              childTableMetadata,
              childColumn: foreignMeta.referenceColumn,
              uniqueName: resolverName,
              parentKey,
              connection
            });
          }
        });
      } else {
        console.log(`type ${foreignMeta.referenceTable} missing`);
      }
    }
  }

  if (array_relationships) {
    for (const relationMeta of array_relationships) {
      const meta = relationMeta.using.foreign_key_constraint_on;
      if (schemaComposer.has(meta.table.name)) {
        const relationTypeComposer = schemaComposer.getOTC(tableMetadata.table);
        relationTypeComposer.setField(relationMeta.name, {
          type: `[${meta.table.name}]!`,
          resolve: parent => {
            const resolverName = `${tableMetadata.table}_${relationMeta.name}`;
            const childrenTableMetadata = getTableMetadata(meta.table.name);
            return oneToManyResolver({
              childrenTableMetadata,
              childrenColumn: meta.column,
              parentKey: parent.id,
              connection: connection,
              uniqueName: resolverName
            });
          }
        });
      } else {
        console.log(`type ${meta.table.name} missing`);
      }
    }
  }
}
