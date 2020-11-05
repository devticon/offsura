import {TableMetadata} from "../version/interfaces";
import {schemaComposer} from "graphql-compose";
import {prepareConnectionResolver} from 'graphql-compose-connection';
import {buildConnectionSort} from "./buildConnectionSort";

const stringComparisonExp = schemaComposer.createInputTC( {
  name: 'String_comparison_exp',
  fields: {
    _eq: "String",
    _like: "String",
    _ilike: "String",
    _qt: "String",
    _qte: "String",
    _lt: "String",
    _lte: "String",
    _in: "[String!]",
    _is_nul: "Boolean",
    _neq: "String",
    _nilike: "String",
    _nin: "[String!]",
  }
})

export function buildConnectionResolver(tableMetadata: TableMetadata) {
  const objectTypeComposer = schemaComposer.getOTC(tableMetadata.table);
  const sort = buildConnectionSort(tableMetadata);

  const resolver =  prepareConnectionResolver(objectTypeComposer, {
    findManyResolver: objectTypeComposer.getResolver('findMany'),
    countResolver: objectTypeComposer.getResolver('count'),
    sort,
  })

  const expName = `${tableMetadata.table}_bool_exp`;
  const whereInput = schemaComposer.createInputTC({
    name: `${tableMetadata.table}_bool_exp`,
    fields: {
      _and: `[${expName}]`,
      _not: `[${expName}]`,
      _or: `[${expName}]`,
    }
  })
  for (const column of tableMetadata.columns) {
    whereInput.setField(column.name, {
      type: stringComparisonExp
    })
  }
  resolver.addArgs({
    where: whereInput
  })
  return resolver;
}
