import { schemaComposer } from "graphql-compose";
import { prepareConnectionResolver } from "graphql-compose-connection";
import { buildConnectionSort } from "./buildConnectionSort";
import { EntityMetadata } from "typeorm/browser";
import { stringComparisonExp } from "./stringComparisonExp";

export function buildConnectionResolver(entityMetadata: EntityMetadata) {
  const objectTypeComposer = schemaComposer.getOTC(entityMetadata.name);
  const sort = buildConnectionSort(entityMetadata);

  const resolver = prepareConnectionResolver(objectTypeComposer, {
    findManyResolver: objectTypeComposer.getResolver("connection"),
    countResolver: objectTypeComposer.getResolver("count"),
    sort,
  });

  const expName = `${entityMetadata.name}_bool_exp`;
  const whereInput = schemaComposer.createInputTC({
    name: `${entityMetadata.name}_bool_exp`,
    fields: {
      _and: `[${expName}]`,
      _not: `[${expName}]`,
      _or: `[${expName}]`,
    },
  });
  for (const column of entityMetadata.columns) {
    whereInput.setField(column.propertyName, {
      type: stringComparisonExp,
    });
  }
  resolver.addArgs({
    where: whereInput,
  });
  return resolver;
}
