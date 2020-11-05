import { GraphQLResolveInfo } from "graphql";
import { TableMetadata } from "../version/interfaces";
import { getConnection } from "../db";
import { FieldNode } from "graphql/language/ast";
import { convertToColumnName } from "../husura/hasuraNames";
import { QueryBuilder } from "knex";
import { getTableMetadata } from "../version";

async function resolveField(
  field: FieldNode,
  queryBuilder: QueryBuilder,
  tableMetadata: TableMetadata,
  alias: string
) {
  const columns = tableMetadata.columns.map(c => c.name);
  const arrayRelationships =
    tableMetadata.hasuraMetadata.array_relationships || [];

  const fieldNameGql = field.name.value;
  const fieldName = convertToColumnName(tableMetadata, fieldNameGql);

  if (columns.includes(fieldName)) {
    queryBuilder.select(`${alias}.${fieldName} as ${fieldNameGql}`);
  } else {
    const arrayRelation = arrayRelationships.find(r => r.name === fieldName);
    if (arrayRelation) {
      const meta = arrayRelation.using.foreign_key_constraint_on;
      queryBuilder.leftJoin(
        `${meta.table.name} as ${fieldName}`,
        `${tableMetadata.table}.id`,
        `${fieldName}.${meta.column}`
      );
      for (const subField of field.selectionSet.selections as FieldNode[]) {
        const relationTableMetadata = await getTableMetadata(meta.table.name);
        await resolveField(
          subField,
          queryBuilder,
          relationTableMetadata,
          fieldName
        );
      }
    }
  }
}
export async function listResolver(
  info: GraphQLResolveInfo,
  tableMetadata: TableMetadata
) {
  const query = info.fieldNodes.find(
    field => field.name.value === info.fieldName
  );
  const connection = getConnection();
  const queryBuilder = connection(tableMetadata.table);

  for (const field of query.selectionSet.selections as FieldNode[]) {
    await resolveField(field, queryBuilder, tableMetadata, tableMetadata.table);
  }
  console.log(queryBuilder.toSQL().sql);
  console.log(await queryBuilder);
  return queryBuilder;
}
