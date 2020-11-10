import fetch from "node-fetch";
import { getCursor, saveCursor } from "./cursor";
import { EntityMetadata } from "typeorm/browser";
import { ReplicationConfig } from "./interfaces";
import { Connection } from "typeorm/browser";
import { naming } from "../naming";

function decodeId(id: string) {
  return JSON.parse(Buffer.from(id, "base64").toString())[3];
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

function gql(table: string, columns: string[], type: "query" | "subscription") {
  return `
       ${type} Pull ($cursor: String, $limit: Int = 100, $orderBy: [${table}_order_by!]!) {
          ${table}_connection(after: $cursor, first: $limit, order_by: $orderBy) {
            edges {
              node {
                ${columns.join("\n")}
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      `;
}
export async function query(
  hasuraUrl: string,
  entityMetadata: EntityMetadata,
  cursor?: string
) {
  const table = entityMetadata.tableName;
  const updatedAtCol = getUpdatedAtName(entityMetadata);
  const orderBy = { [updatedAtCol]: "asc" };
  const columns = entityMetadata.columns.map((column) => column.propertyName);

  return await fetch(`${hasuraUrl}/v1beta1/relay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: gql(table, columns, "query"),
      variables: { cursor, orderBy: orderBy },
    }),
  })
    .then((res) => res.json())
    .then((a) => {
      const { data, errors } = a;
      if (errors) {
        console.log(errors);
        throw new Error("gql error");
      }
      const [key] = Object.keys(data);
      return {
        endCursor: data[key].pageInfo.endCursor,
        hasNextPage: data[key].pageInfo.hasNextPage,
        docs: data[key].edges.map((edge) => edge.node),
      };
    });
}

export async function replicateEntity(
  hasuraUrl: string,
  entityMetadata: EntityMetadata
) {
  const connection = entityMetadata.connection;
  const repository = connection.getRepository(entityMetadata.name);
  let hasNext = true;
  let cursor = await getCursor(connection, entityMetadata.name);
  while (hasNext) {
    const { docs, endCursor, hasNextPage } = await query(
      hasuraUrl,
      entityMetadata,
      cursor
    );
    hasNext = hasNextPage;
    cursor = endCursor;
    if (docs.length) {
      await repository.save(
        docs.map((doc) => {
          if (doc.id) {
            doc.id = decodeId(doc.id);
          }
          return repository.create(doc);
        })
      );
      await saveCursor(connection, entityMetadata.name, cursor);
      console.log("count", entityMetadata.name, await repository.count());
    }
  }
}

export async function startReplication(
  config: ReplicationConfig,
  connection: Connection
) {
  const entityNames = config.tables.map((t) => {
    if (typeof t === "string") {
      return naming.tableToEntityName(t);
    } else {
      return naming.tableToEntityName(t.table);
    }
  });
  for (const entityName of entityNames) {
    await replicateEntity(
      config.hasura.url,
      connection.getMetadata(entityName)
    );
  }
}
