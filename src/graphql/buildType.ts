import { TableMetadata } from "../version/interfaces";
import { mapType } from "./mapTypes";
import { convertToGqlName } from "../husura/hasuraNames";
import { schemaComposer } from "graphql-compose";

export function buildType(tableMetadata: TableMetadata) {
  const objectTypeComposer = schemaComposer.createObjectTC({
    name: tableMetadata.table
  });

  for (const column of tableMetadata.columns) {
    const gqlName = convertToGqlName(tableMetadata, column.name);
    let type = mapType(column.type);

    objectTypeComposer.setField(gqlName, {
      type: `${type}${column.isNullable ? "" : "!"}`,
      extensions: {
        offsura: {
          column: column.name
        }
      }
    });
  }
}
