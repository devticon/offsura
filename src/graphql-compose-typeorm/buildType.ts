import {
  EntityMetadata,
  ObjectLiteral,
  SelectQueryBuilder,
} from "typeorm/browser";
import { sqlToGraphql } from "../typing";
import { schemaComposer } from "graphql-compose";
import { useDataloader } from "./dataloaders";
import { ResolverResolveParams } from "graphql-compose/lib/Resolver";

const nodeInputTC = schemaComposer.createInterfaceTC({
  name: "Node",
  fields: {
    id: "String!",
  },
});

function applySelectionSet(
  queryBuilder: SelectQueryBuilder<any>,
  info: any,
  entityMetadata: EntityMetadata
) {
  const query = info.fieldNodes.find(
    (field) => field.name.value === info.fieldName
  );
  const edge = query.selectionSet.selections.find(
    (s) => s.name.value === "edges"
  );
  const node = edge.selectionSet.selections.find(
    (s) => s.name.value === "node"
  );
}

function findRelationBySource(
  entityMetadata: EntityMetadata,
  source: ObjectLiteral
) {
  const relation = entityMetadata.relations.find(
    (r) => r.inverseEntityMetadata.name === source.constructor.name
  );
  if (!relation) {
    throw new Error(
      `Source relation for (${entityMetadata.name}.${source.constructor.name}) not found`
    );
  }
  return relation;
}

function resolveConnection(
  entityMetadata: EntityMetadata,
  {
    args,
    rawQuery,
    info,
    source,
  }: Partial<ResolverResolveParams<any, any, any>>
) {
  const qb = entityMetadata.connection
    .getRepository(entityMetadata.name)
    .createQueryBuilder(entityMetadata.name)
    .limit(args.limit);

  // applySelectionSet(qb, info, entityMetadata);
  for (const where of rawQuery?.where || []) {
    qb.andWhere(where);
  }
  for (const { column, order } of args.sort) {
    qb.addOrderBy(column, order);
  }
  // applyWhereExp(qb, );
  //
  // for (const [col, exp] of Object.entries(args?.where || {})) {
  // }
  if (source) {
    const relation = findRelationBySource(entityMetadata, source);
    const joinColumn = relation.joinColumns[0];
    const dataloader = useDataloader(
      `${entityMetadata.name}_${relation.propertyName}`,
      (keys: string[]) => {
        const alias = `${relation.propertyName}_${joinColumn.propertyName}`;
        return qb
          .andWhere(
            `${entityMetadata.name}.${joinColumn.propertyName} IN (:...${alias})`,
            { [alias]: keys }
          )
          .getMany()
          .then((docs) => {
            const grouped = Array.from(Array(keys.length), () => []);
            for (const doc of docs) {
              const index = keys.indexOf(doc[joinColumn.propertyName]);
              grouped[index].push(doc);
            }

            return grouped;
          });
      }
    );
    return dataloader.load(source[joinColumn.referencedColumn.propertyName]);
  }
  return qb.getMany();
}

export function buildType(entityMetadata: EntityMetadata) {
  const fields = {};
  for (const column of entityMetadata.columns) {
    fields[column.propertyName] = sqlToGraphql(column.type, column.isNullable);
  }

  const otc = schemaComposer.createObjectTC({
    name: entityMetadata.name,
    fields,
    interfaces: [nodeInputTC],
  });

  otc.setField("id", {
    type: "String!",
    resolve(source) {
      return Buffer.from(
        JSON.stringify({
          type: entityMetadata.name,
          id: entityMetadata.connection
            .getRepository(entityMetadata.name)
            .getId(source),
        })
      ).toString("base64");
    },
  });

  otc.addResolver({
    name: "findById",
  });

  return otc;
}
