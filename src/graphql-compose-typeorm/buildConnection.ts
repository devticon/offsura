import { schemaComposer } from "graphql-compose";
import { EntityMetadata } from "typeorm/browser";
import { stringComparisonExp } from "./stringComparisonExp";
import { Thunk } from "graphql-compose/lib/utils/definitions";
import { InputTypeComposerFieldConfigMapDefinition } from "graphql-compose/lib/InputTypeComposer";
import { ConnectionArgs, ConnectionResult } from "./interfaces";
import { ResolverResolveParams } from "graphql-compose/lib/Resolver";
import { from, Observable } from "rxjs";
import { repeatWhen, tap } from "rxjs/operators";
import { replicas$ } from "../typeorm-hasura-replication";
import { createConnectionQueryBuilder } from "./connectionQueryBuilder";

const pageInfoOTC = schemaComposer.createObjectTC({
  name: "PageInfo",
  fields: {
    hasNextPage: "Boolean!",
    hasPreviousPage: "Boolean!",
    startCursor: "String",
    endCursor: "String",
  },
});

const orderByETC = schemaComposer.createEnumTC({
  name: "order_by",
  values: {
    asc: { value: "ASC" },
    desc: { value: "DESC" },
  },
});

function createOrderByITC(entityMetadata: EntityMetadata) {
  const fields: Thunk<InputTypeComposerFieldConfigMapDefinition> = {};
  for (const column of entityMetadata.columns) {
    fields[column.propertyName] = orderByETC;
  }
  return schemaComposer.createInputTC({
    name: `${entityMetadata.name}_order_by`,
    fields,
  });
}
function createWhereITC(entityMetadata: EntityMetadata) {
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
  return whereInput;
}

export function buildConnectionResolver<
  TSource,
  TContext,
  TArgs extends ConnectionArgs
>(entityMetadata: EntityMetadata) {
  const entityName = entityMetadata.name;
  const nodeOTC = schemaComposer.getOTC(entityName);
  const edgeOTC = schemaComposer.createObjectTC({
    name: `${entityMetadata.name}Edge`,
    fields: {
      cursor: "String!",
      node: nodeOTC.getTypeNonNull(),
    },
  });
  const orderByITC = createOrderByITC(entityMetadata);
  const whereITC = createWhereITC(entityMetadata);
  const connectionOTC = schemaComposer.createObjectTC({
    name: `${entityMetadata.name}Connection`,
    fields: {
      edges: edgeOTC.getTypePlural().getTypeNonNull(),
      pageInfo: pageInfoOTC.getTypeNonNull(),
    },
  });

  const connectionResolver = schemaComposer.createResolver({
    name: `${entityMetadata.name}_connection`,
    type: connectionOTC.getTypeNonNull(),
    args: {
      first: "Int",
      last: "Int",
      after: "String",
      before: "String",
      order_by: orderByITC,
      where: whereITC,
    },
    resolve({
      args,
    }: ResolverResolveParams<any, any, ConnectionArgs>): Observable<
      ConnectionResult<any>
    > {
      return from(
        createConnectionQueryBuilder(entityMetadata)
          .applyArgs(args)
          .getConnection()
      ).pipe(
        tap(() => console.log("toooooooo")),
        repeatWhen(() => replicas$)
      );
    },
  });

  schemaComposer.Query.setField(
    `${entityMetadata.name}_connection`,
    connectionResolver
  );
  // const objectTypeComposer = schemaComposer.getOTC(entityMetadata.name);
  // const sort = buildConnectionSort(entityMetadata);
  //
  // const resolver = prepareConnectionResolver(objectTypeComposer, {
  //   findManyResolver: objectTypeComposer.getResolver("connection"),
  //   countResolver: objectTypeComposer.getResolver("count"),
  //   sort,
  // });
  //

  // resolver.addArgs({
  //   where: whereInput,
  // });
  // return resolver;
}
