import { ConnectionSortMapOpts } from "graphql-compose-connection/lib/connection";
import { EntityMetadata, LessThan, MoreThan } from "typeorm/browser";

export function buildConnectionSort(entityMetadata: EntityMetadata) {
  const sort: ConnectionSortMapOpts = {};

  for (const column of entityMetadata.columns) {
    const beforeCursorQuery = (rawQuery, cursorData, resolveParams) => {
      if (!rawQuery.where) rawQuery.where = [];
      for (let key of Object.keys(cursorData)) {
        rawQuery.where.push({
          [column.propertyName]: LessThan(cursorData[key]),
        });
      }
    };
    const afterCursorQuery = (rawQuery, cursorData, resolveParams) => {
      if (!rawQuery.where) rawQuery.where = [];
      for (let key of Object.keys(cursorData)) {
        rawQuery.where.push({
          [column.propertyName]: MoreThan(cursorData[key]),
        });
      }
    };
    const cursorFields =
      column.propertyName === "id" ? ["id"] : ["id", column.propertyName];

    sort[`${column.propertyName}_asc`] = {
      beforeCursorQuery,
      afterCursorQuery,
      value: [
        {
          column: `${entityMetadata.name}.${column.propertyName}`,
          order: "ASC",
        },
      ],
      cursorFields,
    };
    sort[`${column.propertyName}_desc`] = {
      beforeCursorQuery,
      afterCursorQuery,
      value: [
        {
          column: `${entityMetadata.name}.${column.propertyName}`,
          order: "DESC",
        },
      ],
      cursorFields,
    };
  }

  return sort;
}
