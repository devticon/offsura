import {
  EntityMetadata,
  In,
  ObjectLiteral,
  SelectQueryBuilder,
} from "typeorm/browser";
import { sqlToGraphql } from "../typing";
import { schemaComposer } from "graphql-compose";
import { objectToBase64 } from "../utils/objToBase64";
import composeWithRelay from "graphql-compose-relay";
import { useDataloader } from "./dataloaders";
import { applyWhereExp } from "./applyWhereExp";

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
export function buildType(entityMetadata: EntityMetadata) {
  const fields = {};
  const repository = entityMetadata.connection.getRepository(
    entityMetadata.target
  );
  for (const column of entityMetadata.columns) {
    fields[column.propertyName] = `${sqlToGraphql(column.type)}${
      column.isNullable ? "" : "!"
    }`;
  }

  const otc = schemaComposer.createObjectTC({
    name: entityMetadata.name,
    fields,
  });

  otc.addResolver({
    name: "findById",
  });
  otc.addResolver({
    name: "findOne",
  });
  otc.addResolver({
    name: "connection",
    resolve: function ({ args, rawQuery, info, source }: any) {
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
      for (const [col, exp] of Object.entries(args?.where || {})) {
        applyWhereExp(qb, col, exp);
      }
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
        return dataloader.load(
          source[joinColumn.referencedColumn.propertyName]
        );
      }
      return qb.getMany();
    },
  });
  otc.addResolver({
    name: "count",
  });
  otc.addResolver({
    name: "findMany",
    resolve({ source }) {
      return [];
      const where = {};
      const relation = findRelationBySource(entityMetadata, source);
      const joinColumn = relation.joinColumns[0];
      const dataloader = useDataloader(
        `${entityMetadata.name}_${relation.propertyName}`,
        (keys: string[]) => {
          where[joinColumn.propertyName] = In(keys);
          return repository.find(where).then((docs) => {
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
    },
  });
  otc.setRecordIdFn(({ id }) => objectToBase64([entityMetadata.tableName, id]));

  composeWithRelay(otc);

  return otc;
}
