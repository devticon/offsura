import {TableMetadata} from "../version/interfaces";
import {schemaComposer} from "graphql-compose";
import {ConnectionSortMapOpts} from "graphql-compose-connection/lib/connection";
import {convertToColumnName, convertToGqlName} from "../husura/hasuraNames";

const cache: Map<string, any> = new Map();

export function buildConnectionSort(tableMetadata: TableMetadata) {
  const sort: ConnectionSortMapOpts = {};

  for (const column of tableMetadata.columns) {
    const gqlFieldName = convertToGqlName(tableMetadata, column.name);
    const beforeCursorQuery = (rawQuery, cursorData, resolveParams) => {
      if (!rawQuery.where) rawQuery.where = [];
      for (let key of Object.keys(cursorData)) {
        const columnName = convertToColumnName(tableMetadata, key);
        rawQuery.where.push([`${tableMetadata.table}.${columnName}`, '<', cursorData[key]])
      }
    };
    const afterCursorQuery = (rawQuery, cursorData, resolveParams) => {
      if (!rawQuery.where) rawQuery.where = [];
      for (let key of Object.keys(cursorData)) {
        const columnName = convertToColumnName(tableMetadata, key);
        rawQuery.where.push([`${tableMetadata.table}.${columnName}`, '>', cursorData[key]])
      }
    };
    const cursorFields = column.name === 'id' ? ['id'] : ['id', gqlFieldName];

    sort[`${gqlFieldName}_asc`] = {
      beforeCursorQuery,
      afterCursorQuery,
      value: [{column: `${tableMetadata.table}.${column.name}`, order: "asc"}],
      cursorFields
    }
    sort[`${gqlFieldName}_desc`] = {
      beforeCursorQuery,
      afterCursorQuery,
      value: [{column: `${tableMetadata.table}.${column.name}`, order: "desc"}],
      cursorFields,
    }
  }

  return sort;
}
