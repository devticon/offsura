import { Connection, EntityMetadata, ObjectLiteral } from "typeorm/browser";
import {
  ReplicationConfig,
  SubscribeRecord,
  SubscribeRecords,
  SubscribeResult,
} from "./interfaces";
import { naming } from "../naming";
import { BehaviorSubject, from, merge } from "rxjs";
import { concatMap, filter, switchMap, tap } from "rxjs/operators";
import { ReplicationCursor } from "../entities/ReplicationCursor";
import { HasuraClient } from "./hasuraClient";

function decodeNode(node: ObjectLiteral) {
  if (node.id) {
    return {
      ...node,
      id: JSON.parse(Buffer.from(node.id, "base64").toString())[3],
    };
  }
  return node;
}

function subscribeType(
  connection: Connection,
  type: string,
  hasura: HasuraClient
): SubscribeRecord {
  const sub$ = new BehaviorSubject(type);
  return {
    subject$: sub$,
    $: sub$.pipe(
      switchMap((type) => {
        const cursorRepository = connection.getRepository(ReplicationCursor);
        return from(
          cursorRepository
            .findOne(type)
            .then((cursor) => cursor || cursorRepository.create({ type }))
            .then(({ cursor }) => ({
              cursor,
              meta: connection.getMetadata(type),
            }))
        );
      }),
      switchMap(({ meta, cursor }) => hasura.subscribe(meta, cursor)),
      filter(({ nodes }) => nodes.length > 0)
    ),
  };
}

function saveResults(
  connection: Connection,
  { meta, endCursor, nodes }: SubscribeResult
) {
  return connection
    .transaction(async (trx) => {
      await trx.getRepository(meta.name).save(
        nodes.map((node) => {
          return connection.getRepository(meta.name).create(decodeNode(node));
        })
      );
      await trx.getRepository(ReplicationCursor).save(
        trx.getRepository(ReplicationCursor).create({
          type: meta.name,
          cursor: endCursor,
        })
      );

      return { meta, error: undefined };
    })
    .catch((error) => ({ error, meta }));
}

function handleError(meta: EntityMetadata, error?: any) {
  if (error) {
    console.log("error", {
      type: meta.name,
      code: error.code,
      message: error.message,
    });
  }
}
export async function startReplication(
  config: ReplicationConfig,
  connection: Connection
) {
  const hasura = new HasuraClient(config.hasura.url, config.webSocketImpl);
  const entityNames = config.tables.map((t) => {
    if (typeof t === "string") {
      return naming.tableToEntityName(t);
    } else {
      return naming.tableToEntityName(t.table);
    }
  });

  const subscriptions: SubscribeRecords = {};
  for (const type of entityNames) {
    subscriptions[type] = subscribeType(connection, type, hasura);
  }

  merge(...Object.values(subscriptions).map(({ $ }) => $))
    .pipe(
      concatMap((results) => saveResults(connection, results)),
      tap(({ error, meta }) => handleError(meta, error)),
      tap(({ meta }) => {
        subscriptions[meta.name].subject$.next(meta.name);
      })
    )
    .subscribe();
}
