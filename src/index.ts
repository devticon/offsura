import { getConnection, initConnection } from "./db";
import { getVersionMetadata } from "./version";
import { buildSchema } from "./graphql/buildSchema";
import {graphql, printSchema} from "graphql";
import {offsuraConfig} from "./offsura";
import {readFileSync, writeFileSync} from "fs";

class QueryBuilder {
  private nested: { name: string; qb: QueryBuilder }[] = [];

  constructor(
    public table: string,
    public select: string[] = [],
    public wheres: string[],
    private level = 1
  ) {}

  array(
    name: string,
    table: string,
    select: string[],
    parentCol: string,
    childCol: string
  ) {
    const qb = new QueryBuilder(table, select, [], this.level + 1);
    this.nested.push({ name, qb });
    qb.where(`${this.aliasCol(parentCol)} = ${qb.aliasCol(childCol)}`);

    return qb;
  }

  where(q: string) {
    this.wheres.push(q);
  }

  aliasCol(column: string) {
    return `${this.aliasTable()}__${column}`;
  }

  aliasTable() {
    return `${this.table}${this.level}`;
  }

  toSql() {
    const select = [
      ...this.select.map(s => `'${s}', ${this.aliasCol(s)}`),
      ...this.nested.map(n => `'${n.name}', (${n.qb.toSql()})`)
    ];
    return `
     select
        json_group_array(json_object(${select.join(", ")})) as root${this.level}
    from (
      select ${this.select
        .map(s => `${this.aliasTable()}.${s} as ${this.aliasCol(s)}`)
        .join(", ")}
     from ${this.table} as ${this.aliasTable()}
     ${this.wheres.length ? "where " : ""}${this.wheres.join(" AND ")}
    )
    `;
  }
}
async function main() {
  console.time("db init");
  const metadata = await getVersionMetadata();

  await initConnection();
  let i = 0;
  getConnection().on("query", a => {
    console.log(a.sql, a.bindings);
    i++;
  });
  const schema = buildSchema(metadata, getConnection());

  if(offsuraConfig.emitSchemaFile) {
    writeFileSync('schema.graphql', printSchema(schema))
  }
  const source = readFileSync('./test/product_connection.graphql').toString();
  console.time("result");
  const result = await graphql({ schema, source });
  console.log(JSON.stringify(result, null, 2));
  console.log("query count", i);
  console.timeEnd("result");
}
main();
