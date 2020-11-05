import { TableMetadata } from "../version/interfaces";
import { mapType } from "./mapTypes";
import {convertObjectToGql, convertToGqlName} from "../husura/hasuraNames";
import { schemaComposer } from "graphql-compose";
import composeWithRelay from 'graphql-compose-relay';
import {objectToBase64} from "../utils/objToBase64";
import Knex = require("knex");
import {getTableMetadata} from "../version";
import {useDataloader} from "./dataloaders";
import {applyWhereExp, GraphqlWhereExp} from "./applyWhereExp";

interface ConnectionArgs {
  limit: number
  sort: { column: string, order?: string }[],
  where?: Record<string, GraphqlWhereExp>
}
interface RawQuery {
  where: [string, string, string][];
}
function buildConnectionQueryBuilder(tableMetadata: TableMetadata, args: ConnectionArgs, rawQuery: RawQuery, connection: Knex) {
  const qb = connection(tableMetadata.table)
    .limit(args.limit)
    .orderBy(args.sort);

  if (args.where) {
    for (const column of Object.keys(args.where)) {
      applyWhereExp(qb, column, args.where[column]);
    }
  }
  if (rawQuery && rawQuery.where) {
    for (const [column, operator, value] of rawQuery.where) {
      qb.where(column, operator, value);
    }
  }

  return qb;
}

export function buildType(tableMetadata: TableMetadata, connection: Knex) {
  const objectTypeComposer = schemaComposer.createObjectTC({
    name: tableMetadata.table,
  });

  objectTypeComposer.setRecordIdFn(({id}) => objectToBase64([tableMetadata.table, id]))

  for (const column of tableMetadata.columns) {
    const gqlName = convertToGqlName(tableMetadata, column.name);
    let type = mapType(column.type);

    objectTypeComposer.setField(gqlName, {
      type: `${type}${column.isNullable ? "" : "!"}`,
      extensions: {
        offsura: {
          column: column.name
        }
      }
    });
  }

  objectTypeComposer.addResolver({
    name: "findById",
  })

  const whereInputComposer = schemaComposer.createInputTC({
    name: `${tableMetadata.table}_where`,
    fields: {
      id: "String"
    }
  })
  objectTypeComposer.addResolver({
    name: "findMany",
    resolve({args, rawQuery, info, source}: any) {
      if (info.parentType !== "Query" && source) {
        const relationMeta = getTableMetadata(info.parentType)
          .hasuraMetadata
          .array_relationships.find(r => r.using.foreign_key_constraint_on.table.name === tableMetadata.table)
          .using
          .foreign_key_constraint_on;

        if (!rawQuery) {
          rawQuery = {};
        }
        if (!rawQuery.where) {
          rawQuery.where = [];
        }
        const dataloader = useDataloader(`${tableMetadata.table}_${info.parentType}`, keys => {
          return buildConnectionQueryBuilder(tableMetadata, args, rawQuery, connection)
            .whereIn(relationMeta.column, keys)
            .then(docs => {
              const grouped = Array.from(Array(keys.length), () => []);
              for (const doc of docs) {
                const mapped = convertObjectToGql(tableMetadata, doc);
                const index = keys.indexOf(doc[relationMeta.column]);
                grouped[index].push(mapped);
              }

              return grouped;
            });
        });
        return dataloader.load(source.id)// todo PK!
      }
      return buildConnectionQueryBuilder(tableMetadata, args, rawQuery, connection)
        .then(data => data.map(item => convertObjectToGql(tableMetadata, item)))
    }
  })

  objectTypeComposer.addResolver({
    name: "count",
    resolve({args, rawQuery}: any) {
      return buildConnectionQueryBuilder(tableMetadata, args, rawQuery, connection).count()
    }
  })

  composeWithRelay(objectTypeComposer);
}
