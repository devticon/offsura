import {TableMetadata} from "../version/interfaces";
import {schemaComposer} from "graphql-compose";
import {getTableMetadata} from "../version";
import {oneToOneResolver} from "./oneToOneResolver";
import {convertToGqlName} from "../husura/hasuraNames";
import Knex = require("knex");

export function buildRelations(tableMetadata: TableMetadata, connection: Knex) {
  const {
    array_relationships,
    object_relationships
  } = tableMetadata.hasuraMetadata;
  const objectTypeComposer = schemaComposer.getOTC(tableMetadata.table);

  if (object_relationships) {
    for (const relationMeta of object_relationships) {
      const relationColumn = relationMeta.using.foreign_key_constraint_on;
      const foreignMeta = tableMetadata.foreignKeys.find(
        f => f.column === relationColumn
      );
      if (schemaComposer.has(foreignMeta.referenceTable)) {
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
        const relationConnection = schemaComposer.Query.getField(`${meta.table.name}_connection`);
        objectTypeComposer.setField(`${relationMeta.name}_connection`, relationConnection)
      } else {
        console.log(`type ${meta.table.name} missing`);
      }
    }
  }
}
