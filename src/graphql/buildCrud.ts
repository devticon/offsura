import { TableMetadata } from "../version/interfaces";
import { schemaComposer } from "graphql-compose";
import Knex = require("knex");

interface CRUD {
  queries: any;
}
export function buildCrud(tableMetadata: TableMetadata, connection: Knex) {
  const selectResolver = schemaComposer.createResolver({
    name: tableMetadata.table,
    type: `[${tableMetadata.table}]!`,
    resolve: async ({ info }) => {
      return connection(tableMetadata.table);
      // .join("products_product_categories", "id", "product_id")
      // .limit(1);
    }
  });

  schemaComposer.Query.addFields({
    [tableMetadata.table]: selectResolver
  });

  const crud: CRUD = {
    queries: {}
  };

  return crud;
}
