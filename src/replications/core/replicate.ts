import {TableSchema} from "../../schema/getSchema";
import fetch from "node-fetch";
import {getVersionMetadata} from "../../version";
import {getConnection} from "../../db";

export async function query(schema: TableSchema, cursor?: string) {
    const metadata = await getVersionMetadata();
    const columnNames = metadata.tables.find(t => t.table.name === schema.table).configuration.custom_column_names;
    const query = `
        query Pull ($after: String) {
          ${schema.table}_connection (first: 1, after: $after) {
            edges {
              cursor
              node {
                ${schema.columns.map(col => columnNames[col.name] || col.name).join('\n')}
              }
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      `;

  return await fetch("https://hasura.test.novitus.devticon.com/v1beta1/relay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({query, variables: {after: cursor}}),
  }).then(res => res.json());
}

export async function replicate(
  schema: TableSchema
) {
    let hasNextPage = true;
    let cursor: string;
    while (hasNextPage) {
        const {data, errors} = await query(schema, cursor);
        if (errors) {
            console.log(errors);
            throw new Error('gql error')
        }
        const [key] = Object.keys(data);
        const {edges, pageInfo} = data[key];
        hasNextPage = pageInfo.hasNextPage;

        const nodes = edges.map(e => e.node);
        if (edges.length) {
            cursor = edges[edges.length - 1].cursor;
            console.log(data[key].edges.length, cursor);
        }
        await getConnection()(schema.table).insert(nodes)
    }

}
