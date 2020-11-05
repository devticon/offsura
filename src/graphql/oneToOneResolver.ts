import { TableMetadata } from "../version/interfaces";
import Knex = require("knex");
import { convertObjectToGql } from "../husura/hasuraNames";
import { useDataloader } from "./dataloaders";

interface OneToOneResolverParams {
  childTableMetadata: TableMetadata;
  childColumn: string;
  parentKey: any;
  uniqueName: string;
  connection: Knex;
}

export function buildDataloaderCallback(
  connection: Knex,
  childrenColumn: string,
  childrenTableMetadata: TableMetadata
) {
  return keys =>
    connection(childrenTableMetadata.table)
      .whereIn(childrenColumn, keys)
      .then(docs => {
        const grouped = Array.from(Array(keys.length));
        for (const doc of docs) {
          const mapped = convertObjectToGql(childrenTableMetadata, doc);
          const index = keys.indexOf(doc[childrenColumn]);
          grouped[index] = mapped;
        }

        return grouped;
      });
}

export function oneToOneResolver({
  childTableMetadata,
  childColumn,
  parentKey,
  uniqueName,
  connection
}: OneToOneResolverParams) {
  const dataloader = useDataloader(
    uniqueName,
    buildDataloaderCallback(connection, childColumn, childTableMetadata)
  );
  return dataloader.load(parentKey);
}
