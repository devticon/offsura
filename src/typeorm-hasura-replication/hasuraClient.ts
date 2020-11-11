import fetch from "node-fetch";
import { ReplicationTableConfig, SubscribeResult } from "./interfaces";
import { WebSocketLink } from "apollo-link-ws";
import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { from, Observable } from "rxjs";
import gql from "graphql-tag";
import { EntityMetadata } from "typeorm/browser";
import { map } from "rxjs/operators";

export class HasuraClient {
  client: ApolloClient<any>;
  constructor(private url: string, webSocketImpl?: any) {
    const link = new WebSocketLink({
      uri: `${url}/v1beta1/relay`.replace("https", "wss").replace("http", "ws"),
      webSocketImpl,
    });
    this.client = new ApolloClient({
      link,
      cache: new InMemoryCache(),
    });
  }

  subscribe<T = any>(
    entityMetadata: EntityMetadata,
    cursor?: string
  ): Observable<SubscribeResult<T>> {
    const table = entityMetadata.tableName;
    const columns = entityMetadata.columns
      .map((column) => column.propertyName)
      .join("\n");
    const updatedAtCol = this.getUpdatedAtName(entityMetadata);
    const connectionName = `${table}_connection`;

    return from(
      this.client.subscribe({
        query: gql(`
           subscription Pull ($cursor: String, $limit: Int = 200) {
              ${connectionName} (after: $cursor, first: $limit, order_by: {${updatedAtCol}: asc}) {
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
          `),
        variables: { cursor },
      })
    ).pipe(
      map(({ data, errors }: any) => {
        if (errors) {
          console.log(errors);
          throw new Error("gql error");
        }
        return {
          meta: entityMetadata,
          endCursor: data[connectionName].pageInfo.endCursor,
          hasNextPage: data[connectionName].pageInfo.hasNextPage,
          nodes: data[connectionName].edges.map((edge) => edge.node),
        };
      })
    );
  }

  metadata(tables: (string | ReplicationTableConfig)[]) {
    return fetch(this.url + "/v1/query", {
      method: "POST",
      body: JSON.stringify({ type: "export_metadata", args: {} }),
    })
      .then((res) => res.json())
      .then((meta) => {
        meta.tables = meta.tables.filter((t) => tables.includes(t.table.name));
        return meta;
      });
  }

  runSql(sql: string) {
    return fetch(this.url + "/v1/query", {
      method: "POST",
      body: JSON.stringify({ type: "run_sql", args: { sql } }),
    })
      .then((res) => res.json())
      .then(({ result }) => {
        result.shift();
        return result;
      });
  }

  private getUpdatedAtName(entityMetadata: EntityMetadata) {
    const col = entityMetadata.columns.find((col) =>
      ["updated_at", "updatedAt"].includes(col.propertyName)
    );
    if (!col) {
      throw new Error(`updateAt nof found ${entityMetadata.name}`);
    }
    return col.propertyName;
  }
}
