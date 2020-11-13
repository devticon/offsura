import { EntityMetadata, ObjectLiteral } from "typeorm/browser";
import { schemaComposer } from "graphql-compose";
import { Thunk } from "graphql-compose/lib/utils/definitions";
import { InputTypeComposerFieldConfigMapDefinition } from "graphql-compose/lib/InputTypeComposer";
import { sqlToGraphql } from "../typing";
import { EnumTypeComposerValueConfigMapDefinition } from "graphql-compose/lib/EnumTypeComposer";
import {
  DeleteArgs,
  DeleteOneArgs,
  InsertArgs,
  InsertOneArgs,
  MutationResponse,
  UpdateArgs,
  UpdateOneArgs,
} from "./interfaces";
import { createMutationBuilder } from "./query-builders/mutationBuilder";

function buildUpdateColumnsEnum(entityMetadata: EntityMetadata) {
  const values: EnumTypeComposerValueConfigMapDefinition = {};
  for (const column of entityMetadata.columns) {
    values[column.propertyName] = { value: column.databaseName };
  }
  return schemaComposer.createEnumTC({
    name: `${entityMetadata.tableName}_update_columns`,
    values,
  });
}
function buildPkInput(entityMetadata: EntityMetadata) {
  const fields: Thunk<InputTypeComposerFieldConfigMapDefinition> = {};
  for (const column of entityMetadata.primaryColumns) {
    fields[column.propertyName] = sqlToGraphql(column.type, true);
  }
  return schemaComposer.createInputTC({
    name: `${entityMetadata.tableName}_pk_columns_input`,
    fields,
  });
}
function buildSetInput(entityMetadata: EntityMetadata) {
  const fields: Thunk<InputTypeComposerFieldConfigMapDefinition> = {};
  for (const column of entityMetadata.columns) {
    fields[column.propertyName] = sqlToGraphql(column.type, false);
  }
  return schemaComposer.createInputTC({
    name: `${entityMetadata.tableName}_set_input`,
    fields,
  });
}
function buildMutationResponseObject(entityMetadata: EntityMetadata) {
  const objectTc = schemaComposer.getOTC(entityMetadata.tableName);
  return schemaComposer.createObjectTC({
    name: `${entityMetadata.tableName}_mutation_response`,
    fields: {
      affected_rows: "Int!",
      returning: objectTc.getTypePlural().getTypeNonNull(),
    },
  });
}
export function buildMutations(entityMetadata: EntityMetadata) {
  const entityName = entityMetadata.tableName;
  const fields: Thunk<InputTypeComposerFieldConfigMapDefinition> = {};
  for (const column of entityMetadata.columns) {
    fields[column.propertyName] = {
      type: sqlToGraphql(column.type, column.isNullable || column.isGenerated),
    };
  }
  const updateColumnsEnumTC = buildUpdateColumnsEnum(entityMetadata);
  const pkInputTC = buildPkInput(entityMetadata);
  const setInputTC = buildSetInput(entityMetadata);
  const mutationResponseObjectTC = buildMutationResponseObject(entityMetadata);
  const objectTc = schemaComposer.getOTC(entityName);
  const inputTC = schemaComposer.createInputTC({
    name: `${entityMetadata.tableName}_input`,
    fields,
  });
  const onConflictInputTC = schemaComposer.createInputTC({
    name: `${entityName}_on_conflict`,
    fields: {
      update_columns: updateColumnsEnumTC
        .getTypeNonNull()
        .getTypePlural()
        .getTypeNonNull(),
      where: `${entityName}_bool_exp`,
    },
  });
  schemaComposer.Mutation.addFields({
    [`insert_${entityName}`]: {
      type: mutationResponseObjectTC.getTypeNonNull(),
      args: {
        objects: inputTC.getTypeNonNull().getTypePlural().getTypeNonNull(),
        on_conflict: onConflictInputTC,
      },
      resolve(source: any, args: InsertArgs): Promise<MutationResponse> {
        return createMutationBuilder(entityMetadata)
          .insert()
          .values(args.objects)
          .onConflict(args.on_conflict)
          .getMutationResponse();
      },
    },
    [`insert_${entityName}_one`]: {
      type: objectTc.getTypeNonNull(),
      args: {
        object: inputTC.getTypeNonNull(),
        on_conflict: onConflictInputTC,
      },
      resolve(source: any, args: InsertOneArgs): Promise<ObjectLiteral> {
        return createMutationBuilder(entityMetadata)
          .insert()
          .values(args.object)
          .onConflict(args.on_conflict)
          .getOne();
      },
    },
    [`update_${entityName}`]: {
      type: mutationResponseObjectTC.getTypeNonNull(),
      args: {
        where: `${entityName}_bool_exp`,
        _set: setInputTC.getTypeNonNull(),
      },
      resolve(source: any, args: UpdateArgs) {
        return createMutationBuilder(entityMetadata)
          .update()
          .applyWhere(args.where)
          .set(args._set)
          .getMutationResponse();
      },
    },
    [`update_${entityName}_by_pk`]: {
      type: objectTc.getTypeNonNull(),
      args: {
        pk_columns: pkInputTC.getTypeNonNull(),
        _set: setInputTC.getTypeNonNull(),
      },
      resolve(source: any, args: UpdateOneArgs) {
        return createMutationBuilder(entityMetadata)
          .update()
          .applyPk(args.pk_columns)
          .set(args._set)
          .getOne();
      },
    },
    [`delete_${entityName}`]: {
      type: mutationResponseObjectTC.getTypeNonNull(),
      args: {
        where: `${entityName}_bool_exp`,
      },
      resolve(source: any, args: DeleteArgs) {
        return createMutationBuilder(entityMetadata)
          .delete()
          .applyWhere(args.where)
          .getMutationResponse();
      },
    },
    [`delete_${entityName}_by_pk`]: {
      type: objectTc.getTypeNonNull(),
      args: {
        pk_columns: pkInputTC.getTypeNonNull(),
      },
      resolve(source: any, args: DeleteOneArgs) {
        return createMutationBuilder(entityMetadata)
          .delete()
          .applyPk(args.pk_columns)
          .getOne();
      },
    },
  });
}
