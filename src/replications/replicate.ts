import fetch from "node-fetch";
import { getCursor, saveCursor } from "./cursor";
import { EntityMetadata } from "typeorm";

function getUpdatedAtName(entityMetadata: EntityMetadata) {
  const col = entityMetadata.columns.find((col) =>
    ["updated_at", "updatedAt"].includes(col.propertyName)
  );
  if (!col) {
    throw new Error(`updateAt nof found ${entityMetadata.name}`);
  }
  return col.propertyName;
}

export async function query(
  entityMetadata: EntityMetadata,
  cursor = new Date(0).toISOString()
) {
  const table = entityMetadata.tableName;
  const updatedAtCol = getUpdatedAtName(entityMetadata);
  const orderBy = { [updatedAtCol]: "asc" };

  const query = `
        query Pull($order_by: [${table}_order_by!] = {}, $limit: Int = 30, $cursor: timestamptz!) {
          ${table} (order_by: $order_by, limit: $limit, where: {${updatedAtCol}: {_gt: $cursor}}) {
             ${entityMetadata.columns.map((col) => col.propertyName).join("\n")}
          }
        }
      `;

  return await fetch("https://hasura.test.novitus.devticon.com/v1/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { cursor, order_by: orderBy },
    }),
  }).then((res) => res.json());
}

export async function replicate(entityMetadata: EntityMetadata) {
  const connection = entityMetadata.connection;
  let hasNextPage = true;
  let cursor = await getCursor(connection, entityMetadata.name);
  const updatedAtCol = getUpdatedAtName(entityMetadata);
  while (hasNextPage) {
    const { data, errors } = await query(entityMetadata, cursor);
    if (errors) {
      console.log(errors);
      throw new Error("gql error");
    }
    const [key] = Object.keys(data);
    const docs = data[key];
    hasNextPage = docs.length;
    if (hasNextPage) {
      cursor = docs[docs.length - 1][updatedAtCol];
      await connection
        .getRepository(entityMetadata.name)
        .createQueryBuilder()
        .insert()
        .values(docs)
        .onConflict(`("products_category_id", "product_id") DO NOTHING`);
      await saveCursor(connection, entityMetadata.name, cursor);
    }
  }
}
