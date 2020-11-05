import { convertObjectToGql } from "../husura/hasuraNames";
import { useDataloader } from "./dataloaders";
import { TableMetadata } from "../version/interfaces";
import Knex = require("knex");

interface OneToManyResolverParams {
  childrenTableMetadata: TableMetadata;
  childrenColumn: string;
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
        const grouped = Array.from(Array(keys.length), () => []);
        for (const doc of docs) {
          const mapped = convertObjectToGql(childrenTableMetadata, doc);
          const index = keys.indexOf(doc[childrenColumn]);
          grouped[index].push(mapped);
        }

        return grouped;
      });
}

export function oneToManyResolver({
  childrenTableMetadata,
  childrenColumn,
  parentKey,
  uniqueName,
  connection
}: OneToManyResolverParams) {
  const dataloader = useDataloader(
    uniqueName,
    buildDataloaderCallback(connection, childrenColumn, childrenTableMetadata)
  );
  return dataloader.load(parentKey);
}
