import {TableMetadata} from "../version/interfaces";
import {schemaComposer} from "graphql-compose";
import {prepareConnectionResolver} from 'graphql-compose-connection';
import {buildConnectionSort} from "./buildConnectionSort";


export function buildConnectionResolver(tableMetadata: TableMetadata) {
  const objectTypeComposer = schemaComposer.getOTC(tableMetadata.table);
  const sort = buildConnectionSort(tableMetadata);

  return prepareConnectionResolver(objectTypeComposer, {
    findManyResolver: objectTypeComposer.getResolver('findMany'),
    countResolver: objectTypeComposer.getResolver('count'),
    sort,
  })
}
