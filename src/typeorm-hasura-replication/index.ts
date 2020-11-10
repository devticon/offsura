import { Connection, EntityMetadata, ObjectLiteral } from "typeorm/browser";
import { ReplicationConfig } from "./interfaces";
import { naming } from "../naming";
import { WebSocketLink } from "apollo-link-ws";
import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import gql from "graphql-tag";
import { BehaviorSubject, from, merge, Observable, of } from "rxjs";
import { concatMap, filter, map, mapTo, switchMap, tap } from "rxjs/operators";
import { ReplicationCursor } from "../entities/ReplicationCursor";

function decodeNode(node: ObjectLiteral) {
  if (node.id) {
    return {
      ...node,
      id: JSON.parse(Buffer.from(node.id, "base64").toString())[3],
    };
  }
  return node;
}

function getUpdatedAtName(entityMetadata: EntityMetadata) {
  const col = entityMetadata.columns.find((col) =>
    ["updated_at", "updatedAt"].includes(col.propertyName)
  );
  if (!col) {
    throw new Error(`updateAt nof found ${entityMetadata.name}`);
  }
  return col.propertyName;
}

function generateGql(meta: EntityMetadata) {
  const table = meta.tableName;
  const columns = meta.columns.map((column) => column.propertyName).join("\n");
  const updatedAtCol = getUpdatedAtName(meta);

  return gql(`
       subscription Pull ($cursor: String, $limit: Int = 200) {
          ${table}_connection(after: $cursor, first: $limit, order_by: {${updatedAtCol}: asc}) {
            edges {
              node {
                ${columns}
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      `);
}
type Await<T> = T extends PromiseLike<infer U> ? U : T;

export async function startReplication(
  config: ReplicationConfig,
  connection: Connection
) {
  const link = new WebSocketLink({
    uri: `wss://hasura.test.novitus.devticon.com/v1beta1/relay`,
    webSocketImpl: config.webSocketImpl,
  });
  const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });

  const entityNames = config.tables.map((t) => {
    if (typeof t === "string") {
      return naming.tableToEntityName(t);
    } else {
      return naming.tableToEntityName(t.table);
    }
  });
  function getCursor(type: string) {
    const repo = connection.getRepository(ReplicationCursor);
    return from(
      repo
        .findOne(type)
        .then((cursor) => cursor || repo.create({ type }))
        .then(({ cursor }) => ({ cursor, meta: connection.getMetadata(type) }))
    );
  }
  function subscribe({ cursor, meta }: any) {
    return from(
      client
        .subscribe({
          query: generateGql(meta),
          variables: { cursor },
        })
        .map((res) => ({ meta, ...res }))
    );
  }
  function mapResponse({
    meta,
    data,
    errors,
  }: {
    meta: EntityMetadata;
    data: any[];
    errors: any[];
  }) {
    if (errors) {
      console.log(errors);
      throw new Error("gql error");
    }
    const [key] = Object.keys(data);
    return {
      meta,
      endCursor: data[key].pageInfo.endCursor,
      hasNextPage: data[key].pageInfo.hasNextPage,
      nodes: data[key].edges.map((edge) => edge.node),
    };
  }
  function save({
    nodes,
    endCursor,
    meta,
  }: Await<ReturnType<typeof mapResponse>>) {
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
      })
      .then(() => {
        return { meta };
      })
      .catch((error) => ({ error, meta }));
  }
  const subscriptions$: Record<
    string,
    { subject$: BehaviorSubject<string>; $: Observable<any> }
  > = {};
  for (const type of entityNames) {
    const sub$ = new BehaviorSubject(type);
    subscriptions$[type] = {
      subject$: sub$,
      $: sub$.pipe(
        switchMap(getCursor),
        switchMap(subscribe),
        map(mapResponse),
        filter(({ nodes }) => nodes.length)
      ),
    };
  }

  merge(...Object.values(subscriptions$).map(({ $ }) => $))
    .pipe(
      concatMap(save),
      switchMap(({ error, meta }: any) =>
        of({ error, meta }).pipe(
          //log error message
          tap(() => {
            if (error) {
              console.log("error", {
                type: meta.name,
                code: error.code,
                message: error.message,
              });
            }
          }),
          // delayWhen(() => timer(1000)),
          mapTo(meta)
        )
      ),
      tap((meta) => {
        subscriptions$[meta.name].subject$.next(meta.name);
      })
    )
    .subscribe();
}
