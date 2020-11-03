import fetch from "node-fetch";
import { getConnection } from "../../db";
import { getCursor, saveCursor } from "../../cursor";
import { TableMetadata } from "../../version/interfaces";
import { getTableMetadata } from "../../version";

export async function query(
  tableMetadata: TableMetadata,
  cursor = new Date(0).toISOString()
) {
  const columnNames =
    tableMetadata.hasuraMetadata.configuration.custom_column_names;
  const table = tableMetadata.table;
  const updatedAtCol = columnNames["updated_at"] || "updated_at";
  const orderBy = { [updatedAtCol]: "asc" };

  const query = `
        query Pull($order_by: [${table}_order_by!] = {}, $limit: Int = 30, $cursor: timestamptz!) {
          ${table} (order_by: $order_by, limit: $limit, where: {${updatedAtCol}: {_gt: $cursor}}) {
             ${tableMetadata.columns
               .map(col => columnNames[col.name] || col.name)
               .join("\n")}
          }
        }
      `;
  return await fetch("https://hasura.test.novitus.devticon.com/v1/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { cursor, order_by: orderBy }
    })
  }).then(res => res.json());
}

export async function replicate(table: string) {
  const tableMetadata = await getTableMetadata(table);
  const columnNames =
    tableMetadata.hasuraMetadata.configuration.custom_column_names;
  const updatedAtCol = columnNames["updated_at"] || "updated_at";

  let hasNextPage = true;
  let cursor = await getCursor(table);

  while (hasNextPage) {
    const { data, errors } = await query(tableMetadata, cursor);
    if (errors) {
      console.log(errors);
      throw new Error("gql error");
    }
    const [key] = Object.keys(data);
    const docs = data[key];
    hasNextPage = docs.length;
    if (hasNextPage) {
      cursor = docs[docs.length - 1][updatedAtCol];
      await getConnection()(table).insert(
        docs.map(d => mapToColumnNames(columnNames, d))
      );
      await saveCursor(table, cursor);
    }
  }
  console.log(`replication ${table} done`);
}

function mapToColumnNames(columnNames: Record<string, string>, obj: any) {
  const inverse = {};
  for (const key of Object.keys(columnNames)) {
    inverse[columnNames[key]] = key;
  }
  const mapped: any = {};
  for (const key of Object.keys(obj)) {
    mapped[inverse[key] || key] = obj[key];
  }
  return mapped;
}
